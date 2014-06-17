var mongoose    = require('mongoose'),
	events      = require('events'),
//    async       = require('async'),

	// custom modules
//	Model       = require('./App/Model'),
//	Database    = require('./App/Database'),
//	Socket      = require('./App/Socket'),

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
    var ctrlName = file.substring( 0, file.length - 4 );
    if( ctrl.init )
        ctrl.init();
    Components.Controller[ ctrl.name || ctrlName ] = ctrl;
});

function initServer() {

//	emitter.on('db-connected', onServerReady);


//    Socket.init();
}

initServer();

(function() {


    var http = require('http');

    var server = http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(1337, '127.0.0.1');


	App = {
        init : function() {

            for (var component in Components) {
                Components.Injector.addDependency(
                    component,
                    Components[ component ]
                );
            }

            for ( var obj in Components ) {
                var initFunc = Components[ obj ].init;
                if( initFunc ) {
                    Components.Injector.call( initFunc );
                }
            }

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

    Components.Server       = server;
    Components.Config       = config;
    Components.Controller   = require("./App/Controller");
    Components.Injector     = require("./App/Injector");
    Components.Socket       = require("./App/Socket");
    Components.Module       = require("./App/Module");
    Components.Model        = require("./App/Model");
    Components.Database     = require("./App/Database");

    App.init();
})();

function onServerReady() {
    var ArticleCollection = '';
        console.log(123)
    App.init()
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
//console.log( Components.Socket )
//Components.Socket.
//    onAjaxRequest( "", 'Controller/Sample->getUserByName', ['Marlon', "Marlon Rüscher"], function( $return ) {
//        console.log( $return )
//    } );
