/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IScriptInfo.ts' />
/// <reference path='IUScripts.ts' />
/// <reference path='../apiConfig.ts' />
var glob = require("glob");
var q = require('q');
var app = require('../../app');
var fs = require('fs');
var _ = require('underscore');
var apiConfig = require('../apiConfig');
var helpers = require('./helpers');

var log = {
    error: function (msg) {
        console.error('uscripts: ' + msg);
    }, info: function (msg) {
        console.info('uscripts: ' + msg);
    }
};

function getFiles(pattern) {
    var deferred = q.defer();
    var files = glob.sync(pattern);
    deferred.resolve(files);
    return deferred.promise;
}

function readFileAsync(path) {
    var deferred = q.defer();
    try  {
        var filename = require.resolve(apiConfig.scriptsBase + path);
        var result = fs.readFileSync(filename, 'utf8');
        deferred.resolve(result);
    } catch (e) {
        log.error('Error: ' + e.message);
        deferred.reject(e);
    }
    return deferred.promise;
}

app.appRoute('/uscripts/:year?/:month?', function (request, response) {
    var pattern = helpers.getPattern(request);
    getFiles(pattern).then(function (files) {
        return response.send(files);
    }, function (error) {
        return response.send(error);
    });
});

module.exports = {
    getFiles: getFiles, readFileAsync: readFileAsync
};
//# sourceMappingURL=uscripts.js.map
