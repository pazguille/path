var win = window,
    doc = win.document,
    location = win.location,
    on = 'addEventListener',
    loadEvent = 'load',
    clickEvent = 'click',
    hashchangeEvent = 'hashchange',
    updateEvent = 'popstate',
    router;

function getCurrentPath(target) {
    return target.pathname;
}

function pushState(path, title, data) {
    win.history.pushState(data, title, path);
    doc.title = title;
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
    this.state = {};

    win[on](updateEvent, function () {
        var path = getCurrentPath(location);

        that.currentState = path;

        if (path === '/' || path === undefined) {
            that.match('/');
        } else {
            that.match(path);
        }

    }, false);

    document[on](clickEvent, function (eve) {
        eve = eve || win.event;

        var target = eve.target || eve.srcElement,
            path;

        if (target.nodeName === 'A' && target.getAttribute('data-path') !== null) {
            if (eve.which > 1 || eve.metaKey || eve.ctrlKey || eve.shiftKey || eve.altKey) {
                return;
            }

            // Ignore cross origin links
            if (location.protocol !== target.protocol || location.hostname !== target.hostname) {
                return;
            }

            that.load(getCurrentPath(target), target.title, {});

            eve.preventDefault();
        }
    });

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
        }

        if (path !== '*') {
            this._collection[path].regexp = new RegExp('^' + path.replace(/:\w+/g, '([^\\/]+)').replace(/\//g, '\\/') + '$')
        }
    }

    // Add listeners to a path collection
    this._collection[path].listeners.push(listener);

    return this;
};

/**
 * Removes a path and its litener from the collection with the given path.
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

/**
 * Expose path
 */
exports = module.exports = path;