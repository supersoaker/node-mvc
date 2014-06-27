
var mongoose    = require('mongoose');

function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/**
 * b overwrites a
 * @param a
 * @param b
 * @returns {*}
 */
function extend(a, b){
	for(var key in b)
		if(b.hasOwnProperty(key))
			a[key] = b[key];
	return a;
}
var App = {};
var Database = {};
var Model = {

	init: function( $App ) {
		App = $App;
	},

    newClass: function( modelName, construct ) {
		Database = App.Module.Database
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
	        if( schemaTypes.indexOf( constructInstance[o] ) !== -1 ){
	            schema[o] = constructInstance[o];
                continue;
            }
	        // get the constructor of the variable
            propType = constructInstance[o].constructor;

	        // checks if the constructor is a native type
	        if( schemaTypes.indexOf( propType ) && propType !== String ) {
		        schema[o] = propType;
		        continue;
	        }

	        // if the constructor is not a native type and not a string
	        // the variable is set to Mixed
	        if( propType !== String ) {
				propType = "Mixed";
	        }
            if( propType === String ){
                // check if property is special schema type
                if( propType === "Buffer" ){
	                schema[o] = Buffer;
                } else
                if( propType === "Mixed" ){
	                schema[o] = mongoose.Schema.Types.Mixed;
                } else
                if( propType === "Date" ) {
	                schema[o] = mongoose.Schema.Types.Date;
                } else
                if( propType === "ObjectId" ) {
	                schema[o] = mongoose.Schema.Types.ObjectId;
                } else {
	                schema[o] = String;
                }
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
                modelName : modelName,
	            prototype : construct
            };

	        for( var key in construct )
		        if( construct.hasOwnProperty(key) )
			        this[key] = construct[key];

            for ( var key in model )
		        if( model.hasOwnProperty(key) )
                    this[ key ] = model[ key ];


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

//        ModelClass.prototype = construct;
//		extend( construct,  )

	    return ModelClass;
    },

    getTable : function( tableName ) {
        if( Database.table[ tableName ] ) {
            return Database.table[ tableName ];
        } else {
            throw new Error( 'the database table "'+ tableName +'" does not exist' );
        }
    },

    save : function( model, cb ) {
        var tableName =  model.get('_modelName');
	    console.log("====================")

	    console.log("====================")
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