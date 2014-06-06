
module.exports = Module = {
    availableModules: {},

    initModules: function() {


        // get all modules
        require("fs")
            .readdirSync("./Module")
            .forEach(function( file ) {
                var module = require("./Module/" + file);
                var moduleName = file;
                console.log( moduleName )
                Module.availableModules[ moduleName ] = module;
            });
    }

};