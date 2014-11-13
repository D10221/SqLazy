/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../db.ts' />
/// <reference path='IServerInfoService.ts' />
/// <reference path='ServerInfoService.ts' />
/// <reference path='IServerInfoSearch' />
/// <reference path='../Idb.ts' />
var app = require('../../app');

var fty = require('./ServerInfoService');
var service = new fty();

var app = require('../../app');

function getServerInfo(quinfo, withResults, withError) {
    service.find(quinfo, function (error, results) {
        if (error) {
            if (withError) {
                withError(error);
            } else
                throw error;
        }
        withResults(results);
    });
}

app.appRoute('/serverInfo/:name', function (request, response) {
    var name = request.params.name;
    if (!name)
        response.send(new Error("Name Not Found"));
    var criteria = name ? { server: name } : {};
    getServerInfo(criteria, function (results) {
        response.send(results);
    }, function (error) {
        return response.send(error);
    });
});

app.appRoute('/serverInfo/:name/dbs', function (request, response) {
    var name = request.params.name;
    if (!name)
        response.send(new Error("Name Not Found"));
    var criteria = name ? { server: name } : {};
    getServerInfo(criteria, function (results) {
        response.send(results.map(function (server) {
            return server.db;
        }));
    }, function (error) {
        return response.status(500).send(error);
    });
});

app.appRoute('/serverInfo', function (request, response) {
    service.findAll(function (error, results) {
        if (error)
            response.status(500).send(error);
        else
            response.send(results);
    });
});
//# sourceMappingURL=endpoint.js.map
