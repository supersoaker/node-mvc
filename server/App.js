var io          = require('socket.io').listen(8081),
	mongoose    = require('mongoose'),
	events      = require('events'),

	// custom modules
	Model       = require('./App/Model'),

	// global variables
	emitter     = new events.EventEmitter(),
	db          = {},
	config      = {
		database : 'node-mvc'
    },
    Modules     = {
        Controller: {}
    }

;

//require all controllers
require("fs").readdirSync("./App/Controller").forEach(function(file) {
    var ctrl = require("./App/Controller/" + file);
    if( ctrl.init )
        ctrl.init();
    Modules.Controller[ ctrl.name ] = ctrl;
});

function initServer() {

	emitter.on('db-connected', onServerReady);

	mongoose.connect('mongodb://localhost/'+ config.database);
	db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {  emitter.emit('db-connected');  });

	io.set('log level', 1); // reduce logging
	io.sockets.on('connection', function (socket) {
		console.log( "connection" )
	});


}
initServer();

(function() {

	var Database = {
		// object with all tables
		table: {}
	};

    function capitalizeString(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

	App = {

        exchangeDependencies: function( func, args, callback ) {
            // get the specific callback dependence
            if( typeof callback === "undefined" )
                callback = function() {};

            // get the arguments/dependencies that the method need
            var deps = func
                .toString()
                .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
                .replace(/ /g, '')
                .split(',');

            // set the available dependencies
            var availableDeps = {
                $callback : callback,
                $App      : App
            };

            // iterate the arguments and set the dependencies if needed
            var i = 0;
            while( i < deps.length ){
                // if inject dependencies
                if( typeof availableDeps[ deps[i] ] !== "undefined" ){
                    args.splice(i, 0, availableDeps[ deps[i] ]);
                } else
                // if the argument is not defined set it undefined
                if( i+1 > args.length ) {
                    args[i] = undefined;
                }
                i++;
            }

            return args;
        },

        // todo: auslagern evtl in db
		addNewModel : function( modelName, construct ) {

			var constructInstance = {};
			try {
				constructInstance = new construct();
			} catch (e) {
				// construct is already an instance
				constructInstance = construct;
			}

			var schema      = {},
				schemaTypes = [ String, Array, Object, Number, Boolean ],
				propType;
			// adapt the construct to the schema model of mongoose (only root properties)
			for (var o in constructInstance) {
				// check if the property is already a native variable
				if( schemaTypes.indexOf( constructInstance[o] ) === -1 ){

					continue;
				}
				propType = constructInstance[o].constructor;
				if( schemaTypes.indexOf( propType ) === -1 ){
					schema[o] = {};
				} else {
					if( propType === String ){
						// check if property is special schema type
						if( propType === "Buffer" ){
							constructInstance[o].constructor = Buffer;
						} else
						if( propType === "Mixed" ){
							constructInstance[o].constructor = mongoose.Schema.Types.Mixed;
						} else
						if( propType === "Date" ) {
							constructInstance[o].constructor = mongoose.Schema.Types.Date;
						} else
						if( propType === "ObjectId" ) {
							constructInstance[o].constructor = mongoose.Schema.Types.ObjectId;
						}
						continue;
					}
					schema[o] = constructInstance[o].constructor;
				}
			}

			// save the model table into a local variable
			Database.table[ modelName ] =
				mongoose.model( modelName, mongoose.Schema( schema ) );

			// return the constructor of the model class
			function ModelClass ( model ) {
				model = typeof model !== "undefined" ? model :
					{};
				
				var privates    = {
					modelName : modelName
				};
                for (var key in model) {
                    this[ key ] = model[ key ];
                }

                /**
                 * Set method for properties
                 * @param prop
                 * @returns {*}
                 */
                this.set = function( prop, value ) {
                    var method;

                    method = model[ "set"+ model[ prop ] ];
                    if( typeof model[ method ] === "function" ) {
                        model[ method ]( value );
                        return model;
                    }
                    method = model[ "set"+ capitalizeString( prop ) ];
                    if( typeof model[ method ] === "function" ) {
                        model[ method ]( value );
                        return model;
                    }

                    method = privates[ prop.substring(1) ];
                    if( typeof method !== "undefined" ) {
                        method = value;
                        return model;
                    }

                };

                /**
				 * Get method for properties
				 * @param prop
				 * @param $default
				 * @returns {*}
				 */
                this.get = function( prop, $default ) {
                    var value;

                    // check if the model contains the property
                    value = model[ prop ];
                    if( typeof value !== "undefined" )
						return value;
                    // check if a getter method exists
                    value = model[ "get"+ model[ prop ] ];
                    if( typeof value === "function" )
						return value();
                    // check if a camel-case getter method exists
                    value = model[ "get"+ capitalizeString( prop ) ];
                    if( typeof value === "function" )
                        return value();
                    // check if the private array contains the prop
                    value = privates[ prop.substring(1) ];
					if( typeof value !== "undefined" )
						return value;

                    // return the default value
                    if( typeof $default !== "undefined" ) {
                        return $default;
                    } else {
                        console.error( "Can't get value '%s' and $default is not defined", prop );
					    return false;
                    }
				};

            }
            ModelClass.prototype = construct;
            return ModelClass;
		},

		getModelTable: function( tableName ) {
			if( Database.table[ tableName ] ) {
				return Database.table[ tableName ];
			} else {
				throw new Error( 'the database table "'+ tableName +'" does not exist' );
			}
		},

		saveModel : function( model, cb ) {
            var tableName =  model.get('_modelName');
            new Database.table[ tableName ]( model ).save( function( err, savedModel ) {
//                emitter.emit( 'Database.new-'+ tableName, model );
//	            this.
                cb( err, savedModel );
            }.bind(this) );
		},

        saveModels: function( modelArray, cb ) {
            var i               = 0,
                len             = modelArray.length,
                afterSaveArray  = [];
            while ( i < len ) {
                this.saveModel( modelArray[i], function( err, savedModel ) {
                    if( err ) { console.error.bind(console, 'saving error:'); }
                    afterSaveArray.push( savedModel );
                    if( afterSaveArray.length === len ) {
                        cb( afterSaveArray );
                    }
                } );
                i++;
            }
        }


	};
})();

function onServerReady() {

    var ArticleCollection = '';

	// each model has its own table
//	var Article = App.addNewModel( 'article', {
//        id              : 1,
//		itemId			: 1,
//		galleryUrl 		: "http://google.de",
//		title			: "Default",
//		itemUrl 		: "http://google.de"
//	} );
//
//
//    var art3 = new Article( {
//		id             : 3,
////		itemId			: 1256666,
////		galleryUrl 		: "http://ysdfsdfsdf.com",
////		title			: "das",
//		itemUrl         : "http://sdfsd.de"
//	} );


//	var arr = [art1, art2, art3]
//    var b = App.getModelTable("article")
//	console.log( art3.get('asggsdgs') )
//    console.log(b)
//        .remove({}, function(){ console.log(arguments)});
//    App.saveModels( arr, function( modelSavedArray ) {
//        console.log( modelSavedArray )
//    } )
//	App.saveModel( art1, function( err, obj ) {
//		App.getModelTable("article").find({}, function( err, obj ) {
//			console.log(obj)
//		});
//
//
//	} );



}

/*

 Server.callInto( Server.userModels, 'Controller/Samples->getUserByName', ['Marlon'], function( $return ) {
 console.log( Server.userModels )
 } );

*/
onAjaxRequest( "", 'Controller/Sample->getUserByName', ['Marlon', "Marlon Rüscher"], function( $return ) {
    console.log( $return )
} )
function onAjaxRequest( localVariable, action, args, cb ) {

    // setting variables and check if action exists
    var split = action.split( '/' );
    if( split.length !== 2 )
        return;

    var module = split[0];
    split = split[1].split('->');
    if( split.length !== 2 )
        return;


    var moduleCollection  = Modules[ module ];
    if( !moduleCollection )
        return;

    var moduleName      = split[0],
        moduleInstance = moduleCollection[ moduleName ];
    if( typeof moduleInstance === "undefined" )
        return;

    var method               = split[1],
        moduleInstanceMethod = moduleInstance[ method ];
    // todo: keine _method auswählbar
    if( typeof moduleInstanceMethod === "undefined" )
        return;

    if( !Array.isArray( args ) )
        return;
    // setting variables and check if action exists --END




    // function to emit the $return back to the frontend
    function emitIntoFrontend( $return ){
        console.log( ' frontend gets: ', $return );
    }

    args = App.exchangeDependencies( moduleInstanceMethod, args, emitIntoFrontend );

    var $return = moduleInstanceMethod.apply( moduleInstance, args );
    // if the method is not asynchronous, call the emit function
    if( typeof $return !== "undefined" ){
        emitIntoFrontend( $return );
    }
    // else: function uses async $callback
}

