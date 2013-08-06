# Path JS

Simple routing library using HTML5 history.pushState or hashbang for web browsers.

## Installation

	$ component install pazguille/path

See: [https://github.com/component/component](https://github.com/component/component)

### Standalone
Also, you can use the standalone version without components.
```html
<script src="../standalone/path.js"></script>
```
## How-to

First, initialize the router:
```js
var path = require('path');
```

Now, define some listener for any paths:
```js
function user(id) {
    console.log(id);
}

function userAction(id, action) {
    console.log(id);
    console.log(action);
}
```

Then, add some path to the router:
```js
path('/user/:id', user);
path('/user/:id/:action', userAction);
```

You can also add to an object of path-listener:
```js
path({
    '/user/:id': user,
    '/user/:id/:action': userAction
});
```

```js
path('*', userAction);
```
```js
path(userAction);
```

Somewhere in your HTML code, you should have anchor tags with #hash or #!/hash hyperlinks related to router js structure.
```html
<a href="/user/pazguille" data-path>User</a>
```

## API

### path(path, listener)
Creates a new `path` and stores its `listener` into the collection.
- `path` - The path you want to create.
- `listener` - Listener you want to add to given path.

```js
path('/user/:id', user);
```

### path#remove(path, listener)
Removes a `path` and its `litener` from the collection with the given `path`. The `listener` is optional.
- `path` - The path you want to remove.
- `listener` [optional] - Listener you want to remove from given path.

```js
path.remove('/user/:id', user);
```

### path#getListeners(path)
Returns a collections of `listeners` with the given `path`. The `path` is optional. If not have a `path` as parameter it returns an entire collection of path-listeners.
- `path` [optional]

```js
path.getListeners('/user/:id'); // returns [user]
```

## Contact
- Guillermo Paz (Frontend developer - JavaScript developer | Web standards lover)
- E-mail: [guille87paz@gmail.com](mailto:guille87paz@gmail.com)
- Twitter: [@pazguille](http://twitter.com/pazguille)
- Web: [http://pazguille.me](http://pazguille.me)


## License
Copyright (c) 2013 [@pazguille](http://twitter.com/pazguille) Licensed under the MIT license.