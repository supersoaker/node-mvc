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
    Components  = {
        Controller: {}
    }

;

//require all controllers
require("fs").readdirSync("./App/Controller").forEach(function(file) {
    var ctrl = require("./App/Controller/" + file);
    console.log( file );
    if( ctrl.init )
        ctrl.init();
    Components.Controller[ ctrl.name ] = ctrl;
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

//            this.Injector.dependencies.$App = this;
        },

        __extendClass : function (child, parent) {
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
Socket.
    onAjaxRequest( "", 'Controller/Sample->getUserByName', ['Marlon', "Marlon Rüscher"], function( $return ) {
        console.log( $return )
    } );
