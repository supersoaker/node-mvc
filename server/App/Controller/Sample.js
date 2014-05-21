var Controller = require("./../Controller");
var App = require('./../../App');
var Promise = require('q')

    module.exports = new Controller( {

    name: "Sample",
    getUserByName: function( name ) {
        return new Promise(function(resolve, reject) {

//            App.getModelTable('users').find({}, function(err, models) {
//                if( err ){ reject( err ); }
//                resolve( models );
//            });
            setTimeout( function() {
                resolve({
                    hans: {
                        alter: 12,
                        groesse: 180
                    }
                });
            }, 5000)
        });
    }
} );