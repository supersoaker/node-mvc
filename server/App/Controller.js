
// custom modules
//Controller_Abstract       = require('./App/Controller');


function Controller( newController ) {
    for ( var key in newController ) {
        this[ key ] = newController[ key ];
    }

    if( this.init ){
        this.init();
    }

}

Controller.prototype = {
    name: "Default"
};

module.exports = Controller;