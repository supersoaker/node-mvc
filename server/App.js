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
	App = {
		addNewModel : function( modelName, construct ) {
			// modelName == tableName

			Database.table[ modelName ] =
				mongoose.model( modelName, mongoose.Schema( construct ) );

			// returns the constructor of the model class
			return function( model ) {

				var privates    = {
					modelName : modelName
				};

				/**
				 * Get method for private properties
				 * @param prop
				 * @param $default
				 * @returns {*}
				 */
				model.get = function( prop, $default ) {
					if( typeof model[ prop ] !== "undefined" )
						return model[ prop ];

					prop.slice();

					if( typeof privates[ prop.substring(1) ] !== "undefined" )
						return privates[ prop.substring(1) ];

					$default = typeof $default !== "undefined" ? $default :
						false;
					return $default;
				};
				return model;
			};
		},

		getModelTable: function( tableName ) {
			if( Database.table[ tableName ] ) {
				return Database.table[ tableName ];
			} else {
				throw new Error( 'the database table "'+ tableName +'" does not exist' );
			}
		},

		saveModel : function( model, cb ) {
            var tableName =  model.get('_modelName')
            var dataRow = new Database.table[ tableName ]( model );
			dataRow.save( function() {
                emitter.emit( 'Database.new-'+ tableName, model );
                cb();
            } );
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
        id              : Number,
		itemId			: Number,
		galleryUrl 		: String,
		title			: String,
		itemUrl         : String,
		description     : String,
		listingInfo 	: {
			endTimeSec 			: Number
		},
		sellingStatus 	: {
			currentPrice		: Number
		},
		specific		: {
			primaryCategory		: Array,
			secondaryCategory	: Array,
			producer			: String,
			color				: Array
		}
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
		itemId			: 1256666,
		galleryUrl 		: "http://ysdfsdfsdf.com",
		title			: "das",
		itemUrl         : "http://sdfsd.de"
	});
	var arr = [art1, art2, art3]
    App.saveModels( arr, function( modelSavedArray ) {
        console.log( modelSavedArray )
    } )
//	console.log( art1 )
//	App.saveModel( art1, function( err, obj ) {
//
//		App.getModelTable("article").find({}, function( err, obj ) {
//			console.log(obj)
//		});
//
//	} );

}
