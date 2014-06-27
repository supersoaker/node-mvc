var mongoose    = require('mongoose'),
    Database    = module.exports = {

    connection: {},

    table: {},
    init : function( $Config ) {

        mongoose.connect('mongodb://localhost/'+ $Config.database);
        this.connection = mongoose.connection;
        this.connection.on('error', console.error.bind(console, 'connection error:'));
        this.connection.once('open', function() {
//            emitter.emit('db-connected');
        });

    }
};
