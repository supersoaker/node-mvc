/**
 *
 */
var preDependence = "$";
module.exports = Injector = {


    // the available dependencies
    dependencies : {
        $callback : function() {}
    },
    addDependency: function( depName, dependency ) {
        this.dependencies[ preDependence + depName ] = dependency;
    },
    // the initialisation function
    init : function( $Config ) {
        // $socket is not initialized
//        console.log( $Config )
    },
    // function for applying function with exchanged arguments
    resolve : function( func, args, scope  ) {
        if( typeof scope === "undefined" )
            scope = func;
        args = this.exchangeArguments( func, args );
        func.apply( scope, args );
    },
    // same function as exchangeArguments but shorter
    call : function() {
        this.resolve.apply( this, arguments );
    },
    // function to exchange arguments/dependencies
    exchangeArguments : function( func, args ) {
        if( typeof args === "undefined" )
            args = [];
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
};