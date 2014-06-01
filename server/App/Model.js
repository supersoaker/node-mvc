function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var Model = {

    addNew : function( modelName, construct ) {

        var constructInstance = {};
        try {
            constructInstance = new construct();
        } catch (e) {
            // construct is already an instance
            constructInstance = construct;
        }

        var schema      = {},
            schemaTypes = [ String, Array, Object, Number, Boolean ],
            propType;
        // adapt the construct to the schema model of mongoose (only root properties)
        for (var o in constructInstance) {
            // check if the property is already a native variable
            if( schemaTypes.indexOf( constructInstance[o] ) === -1 ){

                continue;
            }
            propType = constructInstance[o].constructor;
            if( schemaTypes.indexOf( propType ) === -1 ){
                schema[o] = {};
            } else {
                if( propType === String ){
                    // check if property is special schema type
                    if( propType === "Buffer" ){
                        constructInstance[o].constructor = Buffer;
                    } else
                    if( propType === "Mixed" ){
                        constructInstance[o].constructor = mongoose.Schema.Types.Mixed;
                    } else
                    if( propType === "Date" ) {
                        constructInstance[o].constructor = mongoose.Schema.Types.Date;
                    } else
                    if( propType === "ObjectId" ) {
                        constructInstance[o].constructor = mongoose.Schema.Types.ObjectId;
                    }
                    continue;
                }
                schema[o] = constructInstance[o].constructor;
            }
        }

        // save the model table into a local variable
        Database.table[ modelName ] =
            mongoose.model( modelName, mongoose.Schema( schema ) );

        // return the constructor of the model class
        function ModelClass ( model ) {
            model = typeof model !== "undefined" ? model :
            {};

            var privates    = {
                modelName : modelName
            };
            for (var key in model) {
                this[ key ] = model[ key ];
            }

            /**
             * Set method for properties
             * @param prop
             * @returns {*}
             */
            this.set = function( prop, value ) {
                var method;

                method = model[ "set"+ model[ prop ] ];
                if( typeof model[ method ] === "function" ) {
                    model[ method ]( value );
                    return model;
                }
                method = model[ "set"+ capitalizeString( prop ) ];
                if( typeof model[ method ] === "function" ) {
                    model[ method ]( value );
                    return model;
                }

                method = privates[ prop.substring(1) ];
                if( typeof method !== "undefined" ) {
                    method = value;
                    return model;
                }

            };

            /**
             * Get method for properties
             * @param prop
             * @param $default
             * @returns {*}
             */
            this.get = function( prop, $default ) {
                var value;

                // check if the model contains the property
                value = model[ prop ];
                if( typeof value !== "undefined" )
                    return value;
                // check if a getter method exists
                value = model[ "get"+ model[ prop ] ];
                if( typeof value === "function" )
                    return value();
                // check if a camel-case getter method exists
                value = model[ "get"+ capitalizeString( prop ) ];
                if( typeof value === "function" )
                    return value();
                // check if the private array contains the prop
                value = privates[ prop.substring(1) ];
                if( typeof value !== "undefined" )
                    return value;

                // return the default value
                if( typeof $default !== "undefined" ) {
                    return $default;
                } else {
                    console.error( "Can't get value '%s' and $default is not defined", prop );
                    return false;
                }
            };

        }
        ModelClass.prototype = construct;
        return ModelClass;
    },

    getTable : function( tableName ) {
        if( Database.table[ tableName ] ) {
            return Database.table[ tableName ];
        } else {
            throw new Error( 'the database table "'+ tableName +'" does not exist' );
        }
    },

    saveSingle : function( model, cb ) {
        var tableName =  model.get('_modelName');
        new Database.table[ tableName ]( model ).save( function( err, savedModel ) {
//                emitter.emit( 'Database.new-'+ tableName, model );
//	            this.
            cb( err, savedModel );
        }.bind(this) );
    },

    saveMultiple : function( modelArray, cb ) {
        var i               = 0,
            len             = modelArray.length,
            afterSaveArray  = [];
        while ( i < len ) {
            this.saveSingle( modelArray[i], function( err, savedModel ) {
                if( err ) { console.error.bind(console, 'saving error:'); }
                afterSaveArray.push( savedModel );
                if( afterSaveArray.length === len ) {
                    cb( afterSaveArray );
                }
            } );
            i++;
        }
    }

};
module.exports = Model;