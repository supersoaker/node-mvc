// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.



// property watcher functions for 2 way bindings
function addPropWatcher( obj, prop, handler ) {
    var
        oldval = obj[prop]
        , newval = oldval
        , getter = function () {
            return newval;
        }
        , setter = function (val) {
            oldval = newval;
            return newval = handler.call(obj, prop, oldval, val);
        }
        ;

    if (delete obj[prop]) { // can't watch constants
        Object.defineProperty(obj, prop, {
            get: getter
            , set: setter
            , enumerable: true
            , configurable: true
        });
    }
}
function unsetPropWatcher( obj, prop ) {
    var val = obj[prop];
    delete obj[prop]; // remove accessors
    obj[prop] = val;
}