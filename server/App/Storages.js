module.exports = Storages = {

    init: function( request ) {},

    onSocketConnection: function( socket ) {
        return {
            preHandling: function() {},
            postHandling: function() {}
        };
    },


    session: {},
    cookie: {},
    local: {}

};