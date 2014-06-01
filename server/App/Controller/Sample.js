var Controller = require("./../Controller");

module.exports = new Controller( {

    name: "Sample",

    init: function() {},

    $$getUserByName: function( name, fullname, $App, $callback ) {

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
} );
