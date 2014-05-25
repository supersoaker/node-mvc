var mongoose    = require('mongoose'),
	events      = require('events'),

	// custom modules
	Model       = require('./App/Model'),
	Database    = require('./App/Database'),
	Socket      = require('./App/Socket'),

	// global variables
	emitter     = new events.EventEmitter(),
	db          = {},
	config      = {
		database : 'node-mvc'
    },
    App         = {},
    Modules     = {
        Controller: {}
    }

;
__extends = function (child, parent) {
    for (var key in parent) {
        if (parent.hasOwnProperty(key)) child[key] = parent[key];
    }

    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};


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

    Socket.init();
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
        init : function() {

            this.Injector.dependencies.$App = this;
        },
        Injector : {
            // the available dependencies
            dependencies : {
                $callback : function() {},
                $App      : {}
            },
            // function for applying function with exchanged arguments
            resolve : function( func, args, scope  ) {
                if( typeof scope === "undefined" )
                    scope = func;
                args = this.exchangeArguments( func, args );
                func.apply( scope, args );
            },
            // function to exchange arguments/dependencies
            exchangeArguments : function( func, args ) {
                var deps = this.getArguments( func );
                // iterate the arguments and set the dependencies if needed
                var i = 0;
                while( i < deps.length ){
                    // if inject dependencies
                    if( typeof this.dependencies[ deps[i] ] !== "undefined" ){
                        args.splice(i, 0, this.dependencies[ deps[i] ]);
                    } else
                    // if the argument is not defined set it undefined
                    if( i+1 > args.length ) {
                        args[i] = undefined;
                    }
                    i++;
                }
                return args;
            },
            // get the arguments from the function
            getArguments : function( func ) {
                // get the arguments/dependencies that the method need
                return func
                    .toString()
                    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
                    .replace(/ |\r\n|\/\/|\/*...*\//g, '')
                    .split(',');
            }
        }

	};
    App.init();
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
} );
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
    if( typeof method.indexOf('_') == 0 )
        return;
    if( typeof moduleInstanceMethod === "undefined" )
        return;
    // native v8 method
    if( !Array.isArray( args ) )
        return;
    // setting variables and check if action exists --END




    // function to emit the $return back to the frontend
    function emitIntoFrontend( $return ){
        console.log( ' frontend gets: ', $return );
    }

    App.Injector.dependencies.$callback = emitIntoFrontend;
    App.Injector.resolve( moduleInstanceMethod, args, moduleInstance );

    // if the method is not asynchronous, call the emit function
    if( typeof $return !== "undefined" ){
        emitIntoFrontend( $return );
    }
    // else: function uses async $callback
}

