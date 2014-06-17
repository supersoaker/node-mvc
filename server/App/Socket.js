var publicFuncMark  = '$$',
    Socket          = module.exports = {

        init : function( $Server ) {
            console.log( "socket")
            var io = require('socket.io')( $Server );

            io.on('connection', function (socket) {
//                console.log( socket )
                console.log( "connection" )
            });
        },
        components: {},

        onAjaxRequest: function( localVariable, action, args, cb ) {

            // setting variables and check if action exists
            var split = action.split( '/' );
            if( split.length !== 2 )
                return;

            var module = split[0];
            split = split[1].split('->');
            if( split.length !== 2 )
                return;

            var moduleCollection  = this.components[ module ];
            if( !moduleCollection )
                return;

            var moduleName      = split[0],
                moduleInstance = moduleCollection[ moduleName ];
            if( typeof moduleInstance === "undefined" )
                return;

            var method               = publicFuncMark + split[1],
                moduleInstanceMethod = moduleInstance[ method ];
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

//            this.components.dependencies.$callback = emitIntoFrontend;
//            this.components.Injector.resolve( moduleInstanceMethod, args, moduleInstance );

            // if the method is not asynchronous, call the emit function
            if( typeof $return !== "undefined" ){
                emitIntoFrontend( $return );
            }
            // else: function uses async $callback
        }


};
