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
    return function( modelName, watchesOn ) {
        var elem        = document.querySelector( '[data-model-view="'+ modelName +'"]' );
        var template    = (modelTemplates[ modelName ] = modelTemplates[ modelName ] || elem.innerHTML);
        var currentHtml = "";
        var newHtml     = template;
        var variable    = "";
        var self        = this;
		var key         = "";

		watchesOn       = watchesOn || [];
        this.viewElem   = elem;


        function updatePropInView( prop, oldVal, newVal ) {
	        console.log("updatePropInView")
            if( oldVal !== newVal ) {
                updatePropsInView( prop, newVal );
            }
            return newVal;
        }

	    if( watchesOn > 0 ){
		    for( key in watchesOn ) {
			    addPropWatcher( this, key, updatePropInView );
		    }
	    } else {
	        for( key in this ) {
	            addPropWatcher( this, key, updatePropInView );
	        }
	    }

        function updatePropsInView( prop, newVal ) {
            var reg = /\{\{(.*?)\}\}/g;
	        var re = "";
            while( re = reg.exec( template ) ){
                variable = trim( re[1] );
                if( typeof self[ variable ] !== "undefined" ) {
                    if( variable === prop ){
                        newHtml = newHtml.replace( re[0], newVal );
                    } else {
                        newHtml = newHtml.replace( re[0], self[ variable ] );
                    }
                }
            }
            if( newHtml !== currentHtml ) {
                elem.innerHTML = newHtml;
            }
            currentHtml = newHtml;
            newHtml = template;
        }
        updatePropsInView();

    }

}());
App.Model.prototype = {
	watchesOn: [],
    options: 12,
    viewElem: {},
    view: "",
    bla: 432
};



var blub = new App.Model( "testModel" );
var b = document.querySelector( '[data-model-view]' )
b.style.display = "block"



function startTest() {
    console.time('updatePropInView')
    for( var i = 0; i<100000; i++){
        blub.options = i;
    }
    console.timeEnd('updatePropInView')
}