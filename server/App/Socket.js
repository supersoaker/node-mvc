var io          = require('socket.io').listen(8081),
    Socket      = module.exports = {

        init : function() {
            io.set('log level', 1); // reduce logging
            io.sockets.on('connection', function (socket) {
                console.log( "connection" )
            });
        }
    };
