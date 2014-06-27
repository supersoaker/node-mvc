var Controller = require("./../Controller");

module.exports = new Controller( {

//    name: "Sample",
    // todo: adding router module / request module
    getRoutes: {
        'management/': this.$$getUserByName
    },

	allowAjax: [
		this.$$getUserByName
	],

    init: function() {},

	getUserByName: function( name, fullname, $App, $callback ) {

        // examples: async functions which uses the $callback dependence
        setTimeout( function() {
            $callback({
                hans: {
                    alter: 12,
                    groesse: 180
                }
            });
        }, 5000);

//        $App.getModelTable('users').find({ name: name }, function(err, models) {
//            if( err ) console.error( err );
//            $callback( models );
//        });



        // example: normal return function
//        return {
//            hans: {
//                alter: 14
//            }
//        }
    }
}, ['egegr', 'ergegr']);

//module.exports.ajax = ['egegr', 'ergegr'];
