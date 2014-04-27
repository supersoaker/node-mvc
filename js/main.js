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

App.model = (function() {

    return function( modelName ) {
        var elem = document.querySelector( '[data-model-view="'+ modelName +'"]' );
        var html = elem.innerHTML;
        var currentHtml = html;

        function updateView( fn ) {
            for( var key in this ) {
                if( fn ) {
                    fn( key );
                }
                var newHtml = html.replace( "{{ "+ key +" }}", this[key] );
            }
            if( newHtml !== currentHtml ) {
                elem.innerHTML = newHtml;
            }
            currentHtml = newHtml;
        }

        function handler( prop, oldVal, newVal ) {
            updateView();
        }

        this.viewElem = elem;
        this.view = '';
        this.options = 12;
        this.bla = 432;

        updateView( function( key ) {
            addPropWatcher( this, key, handler )
        } );
    }
}());
App.model.prototype = {
    options: 0,
    view: "",
    bla: 0
};

var onPropChange = function () {

    console.log( "model.options hat sch geändert" )
    console.log( arguments )

}
//App.model.watch('options', handler);

var blub = new App.model( "testModel" );

var moep = {
    options: 0
}
addPropWatcher( moep, 'options', onPropChange );
