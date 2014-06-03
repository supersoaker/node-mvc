//function onReady ( callback ){
//    var addListener = document.addEventListener || document.attachEvent,
//        removeListener =  document.removeEventListener || document.detachEvent
//    eventName = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange"
//
//    addListener.call(document, eventName, function(){
//        removeListener( eventName, arguments.callee, false )
//        callback()
//    }, false )
//}
var App = {};
function trim ( str ) {
    return str.replace(/^\s+|\s+$/g, '');
}

App.Model = (function() {
    var modelTemplates = {};
    var modelElems = {};
    return function( modelName, prototype ) {
	    prototype = typeof prototype !== "undefined" ? prototype :
	    	{};
        var template    = "";
        var elem;

        if( modelTemplates[ modelName ] ){
            template        = modelTemplates[ modelName ];
            // setting the new element as a clone of the structure Element
            elem            = modelElems[ modelName ].cloneNode(true);
        } else {
            elem                        = document.querySelector( '[data-model-view="'+ modelName +'"]' );
            template                    = elem.innerHTML;
            modelTemplates[ modelName ] = template;
            modelElems[ modelName ]     = elem;

            // remove the children, because the innerHtml is set through the template
            while ( modelElems[ modelName ].children.length ) {
                modelElems[ modelName ].removeChild( modelElems[ modelName ].children[0] );
            }
        }
        var currentHtml = "";
        var newHtml     = template;
        var variable    = "";
        var model       = prototype;
		var key         = "";
		var watchesOn   = prototype.watchesOn || this.watchesOn;
	    var privates    = {
	        viewElem    : elem,
		    viewTemplate: template,
		    watchers    : watchesOn
	    };

	    /**
	     * Get method for private properties
	     * @param prop
	     * @param $default
	     * @returns {*}
	     */
	    model.get        = function( prop, $default ) {
		    if( typeof model[ prop ] !== "undefined" )
				return model[ prop ];

			if( typeof privates[ prop ] !== "undefined" )
				return privates[ prop ];

		    $default = typeof $default !== "undefined" ? $default :
		    	privates;
		    return $default;
	    };

        function updatePropInView( prop, oldVal, newVal ) {
	        console.log("updatePropInView")
            if( oldVal !== newVal ) {
                updatePropsInView( prop, newVal );
            }
            return newVal;
        }


	    if( watchesOn.length > 0 ){
		    for( key in watchesOn ) {
			    addPropWatcher( model, watchesOn[ key ], updatePropInView );
		    }
	    } else {
	        for( key in this ) {
	            addPropWatcher( model, key, updatePropInView );
	        }
	    }

        function updatePropsInView( prop, newVal ) {
	        var reg = /\{\{(.*?)\}\}/g;
	        var re = "";
            while( re = reg.exec( template ) ){
                variable = trim( re[1] );
                if( typeof model[ variable ] !== "undefined" ) {
                    if( variable === prop ){
                        newHtml = newHtml.replace( re[0], newVal );
                    } else {
                        newHtml = newHtml.replace( re[0], model[ variable ] );
                    }
                }
            }
            if( newHtml !== currentHtml ) {
                elem.innerHTML = newHtml;
            }
            currentHtml = newHtml;
            newHtml     = template;
        }
        updatePropsInView();

	    return model;
    }

}());

/**
 * the prototype of all models
 * @type {{_: {}, watchesOn: Array, options: number, view: string, bla: number}}
 */
App.Model.prototype = {
	_ : {},
	watchesOn: [],
	get: function() {}
};

// todo: App.addModel
//App.addModel
/*
var blub  = new App.Model( "testModel", {
	watchesOn: [],
	options: 12,
	view: "",
	bla: 432
} );
//var blub1 = new App.Model( "testModel" );
//var blub2 = new App.Model( "testModel" );
blub.options = 99
var b = document.querySelector( '[data-model-view]' )
b.style.display = "block"



function startTest() {
    console.time('updatePropInView')
    for( var i = 0; i<100000; i++){
        blub.options = i;
    }
    console.timeEnd('updatePropInView')
}*/