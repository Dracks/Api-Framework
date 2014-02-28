
/**
	* Node.js Login Boilerplate
	* More Info : http://bit.ly/LsODY8
	* Copyright (c) 2013 Stephen Braitsch
**/

var express = require('express');
var http = require('http');
var app = express();

var config=require('./config.js');

var server = require('mongodb').Server(config.dbHost, config.dbPort, {auto_reconnect: true});

app.configure(function () {
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
	app.set('ip', process.env.OPENSHIFT_NODEJS_IP);
	app.set('views', __dirname + '/admin/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	//app.use(express.urlencoded());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret' }));
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/admin/public' }));
	app.use(express.static(__dirname + '/admin/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

require('./api/main.js')(app, server);

//require('./admin/server/router')(app);

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
	console.log("Express server listening on port " + app.get('port'));
});