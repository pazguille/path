/**
 * Module dependencies.
 */
var express = require('express'),
	app = module.exports = express();

/**
 * App configuration.
 */
app.use('/', express.static(__dirname + '/'));
app.use('/contact', express.static(__dirname + '/'));
app.use('/build', express.static(__dirname + '/../build'));
app.use('/standalone', express.static(__dirname + '/../standalone'));

/**
 * Listen
 */
app.listen(8080);