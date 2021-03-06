﻿/// <reference path='typings/tsd.d.ts' />
var express = require('express');

var http = require('http');
var path = require('path');
var app = express();

//CORS middleware
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', ['Content-Type', 'Authorization']);
    next();
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(allowCrossDomain);
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'bower_components')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var db = require('./api/db.js');

module.exports = {
    appRoute: function (p, f) {
        app.get(p, f);
    }
};

require('./api/netQuery'); // defines its own routes
require('./api/scripts/uscripts');
require('./api/scripts/scriptInfoSvc');
require('./api/serverInfo/endpoint');

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
//# sourceMappingURL=app.js.map
