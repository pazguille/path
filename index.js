var win = window,
    doc = win.document,
    location = win.location,
    on = win.addEventListener ? 'addEventListener' : 'attachEvent',
    loadEvent = (on === 'attachEvent') ? 'onload' : 'load',
    clickEvent = (on === 'attachEvent') ? 'onclick' : 'click',
    hashchangeEvent = (on === 'attachEvent') ? 'onhashchange' : 'hashchange',
    supported = (win.onpopstate !== undefined),
    updateEvent = 'popstate',
    navigationBar = true,
    router,
    getCurrentPath = function (target) {
        return target.pathname;
    },
    pushState = function (path, title, data) {
        win.history.pushState(data, title, path);

        // title is currently ignored by History API.
        doc.title = title;
    };

if (!supported) {
    getCurrentPath = function (target) {
        return target.hash.split('#!')[1] || '/';
    };

    pushState = function (path, title, data) {
        var hash = location.hash.match(/\#!?\/?(.[^\?|\&|\s]+)/),
            regExp;

        hash  = hash ? hash[1] : '/';
        regExp = new RegExp(hash);
        location.hash.replace(regExp, path);
        doc.title = title;
    };
}

/**
 * Router Class
 */

/**
 * Create a new router.
 * @constructor
 * @property {array} paths
 * @property {string} regexp
 * @returns {Object}
 */
function Router() {
    this.init();

    return this;
}

/**
 * Initialize a new router.
 * @constructs
 */
Router.prototype.init = function () {

    var that = this;
    this._collection = {};

    win[on](loadEvent, function () {
        that.currentState = getCurrentPath(location);
        that.match(that.currentState);
    }, false);

    win[on](updateEvent, function () {
        that.currentState = getCurrentPath(location);
        that.match(that.currentState);
    }, false);

    doc[on](clickEvent, function (eve) {
        eve = eve || win.event;

        var target = eve.target || eve.srcElement;

        if (target.nodeName === 'A' && target.getAttribute('data-path') !== null) {
            if (eve.which > 1 || eve.metaKey || eve.ctrlKey || eve.shiftKey || eve.altKey) {
                return;
            }

            // Ignore cross origin links
            if (location.protocol !== target.protocol || location.hostname !== target.hostname) {
                return;
            }

            that.load(getCurrentPath(target), target.title, {});

            if (supported) {
                eve.preventDefault();
            } else {
                navigationBar = false;
            }
        }
    });

    if (!supported) {

        win[on](hashchangeEvent, function () {

            if (navigationBar) {
                var path = location.hash.match(/\#!?(.[^\?|\&|\s]+)/);
                path = path ? path[1] : '/';
                that.currentPath = path;
                that.match(that.currentPath);
            }

            navigationBar = true;
        });
    }

    return this;

};

/**
 * Checks if the current path matches with a path.
 * @param {string} path - The current path.
 */
Router.prototype.match = function (path) {
    var collection = this._collection,
        listeners,
        key,
        i = 0,
        pathname,
        params,
        len;

    for (key in collection) {

        if (collection[key] !== undefined && key !== '*') {

            pathname = collection[key];

            params = path.match(pathname.regexp);

            if (params) {

                params.splice(0, 1);

                listeners = collection[key].listeners;

                len = listeners.length;

                for (i; i < len; i += 1) {
                    listeners[i].apply(undefined, params);
                }
            }
        }
    }

    if (collection['*'] !== undefined) {
        i = 0;
        listeners = collection['*'].listeners;
        len = listeners.length;

        for (i; i < len; i += 1) {
            listeners[i]();
        }
    }

    return this;
};

/**
 * Creates a new path and stores its listener into the collection.
 * @param {string} path -
 * @param {funtion} listener -
 */
Router.prototype.define = function (path, listener) {
    // Create new path
    if (this._collection[path] === undefined) {
        this._collection[path] = {
            'listeners': []
        };

        if (path !== '*') {
            this._collection[path].regexp = new RegExp('^' + path.replace(/:\w+/g, '([^\\/]+)').replace(/\//g, '\\/') + '$');
        }
    }

    // Add listeners to a path collection
    this._collection[path].listeners.push(listener);

    return this;
};

/**
 * Removes a path or its litener from the collection with the given path.
 * @param {string} path
 * @param {funtion} listener
 */
Router.prototype.remove = function (path, listener) {
    var listeners = this._collection[path].listeners,
        i = 0,
        len = listeners.length;

    if (len !== undefined) {
        for (i; i < len; i += 1) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                break;
            }
        }
    }

    if (listeners.length === 0 || listener === undefined) {
        delete this._collection[path];
    }

    return this;
};

/**
 * Returns a collections of listeners with the given path or an entire collection.
 * @param {string} path
 * @return {array}
 */
Router.prototype.getListeners = function (path) {
    return (path !== undefined) ? this._collection[path] : this._collection;
};

/**
 * Returns a collections of listeners with the given path or an entire collection.
 * @param {string} path
 * @return {array}
 */
Router.prototype.load = function (path, title, data) {

    this.currentState = path;
    pushState(path, title, data);
    this.match(path);

    return this;
};

router = new Router();

/**
 * path Function
 */

function path() {

    var listeners = Array.prototype.slice.call(arguments, 0), // converted to array
        pathname = listeners.shift(),
        key,
        len;

    if (typeof pathname === 'object') {

        for (key in pathname) {
            if (pathname[key] !== undefined) {
                router.define(key, pathname[key]);
            }
        }

    } else {

        if (typeof pathname === 'function') {
            listeners.unshift(pathname);
            pathname = '*';
        }

        key = 0;
        len = listeners.length;

        for (key; key < len; key += 1) {
            router.define(pathname, listeners[key]);
        }
    }

    return path;
}

path.load = function (pathname, title, data) {
    router.load(pathname, title, data);

    return path;
};

path.remove = function (pathname, listener) {
    router.remove(pathname, listener);

    return path;
};

path.getListeners = function (pathname) {
    return router.getListeners(pathname);
};

/**
 * Expose path
 */
exports = module.exports = path;