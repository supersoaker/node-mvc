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
	}

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

var App = {};
(function() {

	var Database = {
		// object with all tables
		table: {}
	};

    function capitalizeString(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

	App = {
		addNewModel : function( modelName, construct ) {

			var constructInstance = {};
			try {
				constructInstance = new construct();
			}
			catch (e) {
				// construct is already an instance
				constructInstance = construct;
			}

			var schema      = {},
				schemaTypes = [ String, Array, Object, Number, Boolean ],
				propType;
			// adapt the construct to the schema model of mongoose
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

			// returns the constructor of the model class
			var modelClass = function( model ) {
				model = typeof model !== "undefined" ? model :
					{};
				
				var privates    = {
					modelName : modelName
				};

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
					return $default || false;
				};
			};
			console.log( construct )
			modelClass.prototype = construct;
			return modelClass;
		},
		getNewModelObject: function(){

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

	// each model has its own table
	var Article = App.addNewModel( 'article', {
        id              : 1,
		itemId			: 1,
		galleryUrl 		: "http://google.de",
		title			: "Default",
		itemUrl 		: "http://google.de"
	} );
	var art1 = new Article({
		id             : 1,
		itemId			: 1256666,
		galleryUrl 		: "http://ysdfsdfsdf.com",
		title			: "das",
		itemUrl         : "http://sdfsd.de"
	});	var art2 = new Article({
		id             : 2,
		itemId			: 1256666,
		galleryUrl 		: "http://ysdfsdfsdf.com",
		title			: "das",
		itemUrl         : "http://sdfsd.de"
	});	var art3 = new Article({
		id             : 3,
//		itemId			: 1256666,
//		galleryUrl 		: "http://ysdfsdfsdf.com",
//		title			: "das",
		itemUrl         : "http://sdfsd.de"
	});
	var arr = [art1, art2, art3]
    var b = App.getModelTable("article")
	console.log( art3 )
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
