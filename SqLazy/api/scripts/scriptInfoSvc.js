/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IScriptInfo.ts' />
/// <reference path='IScriptInfoService.ts' />
/// <reference path='IUScripts.ts' />
/// <reference path='ScriptInfo.ts' />
/// <reference path='IUScripts.ts' />
var _this = this;
var q = require('q');
var app = require('../../app');
var fs = require('fs');
var _ = require('underscore');
var uscripts = require("./uscripts");
var helper = require('./helpers');
var scriptInfo = require('./ScriptInfo');
var url = require('url');
var fty = function (config) {
    return new scriptInfo(config);
};

var log = {
    info: function (msg) {
        return console.info(_this.name + msg);
    },
    error: function (msg) {
        return console.error(_this.name + msg);
    }
};

function toScriptInfo(paths) {
    return paths.map(function (path) {
        return fty({ path: path, sql: '*' });
    });
}

function getLazyScriptInfos(pattern) {
    return uscripts.getFiles(pattern).then(function (paths) {
        return paths.map(function (path) {
            return fty({
                path: path, sql: function () {
                    var deferredText = q.defer();
                    uscripts.readFileAsync(path).then(function (text) {
                        deferredText.resolve(new ScriptInfo({ path: path, sql: text }));
                    }, function (error) {
                        return deferredText.reject(error);
                    });
                    return deferredText.promise;
                } });
        });
    });
}

function getScriptInfos(pattern) {
    var scriptInfos = q.defer();
    uscripts.getFiles(pattern).then(function (paths) {
        console.log('Got Paths');
        var promises = paths.map(function (path) {
            return uscripts.readFileAsync(path).then(function (text) {
                return {
                    path: path, state: '?', sql: text, cmdAction: 'ExecuteReader', cmdType: 'Text'
                };
            });
        });
        q.all(promises).then(function (all) {
            var result = all.map(function (x) {
                return x;
            });
            console.log('delivering %d results', result.length);
            scriptInfos.resolve(result);
        }, function (errors) {
            return scriptInfos.reject(new Error('getScriptInfos: Failed'));
        });
    }, function (error) {
        return scriptInfos.reject(error);
    });
    return scriptInfos.promise;
}

app.appRoute('/scriptInfo/:year?/:month?/lazy', function (request, response) {
    var pattern = helper.getPattern(request);
    getLazyScriptInfos(pattern).then(function (result) {
        return response.send(result);
    }, function (error) {
        return response.status(500).send(error);
    });
});

app.appRoute('/scriptInfo/:year?/:month?', function (request, response) {
    var pattern = helper.getPattern(request);
    var parts = url.parse(request.url, true);
    if (parts.name) {
        pattern = pattern.replace(/\*\.sql/, parts.name);
    }

    getScriptInfos(pattern).then(function (result) {
        return response.send(result);
    }, function (error) {
        return response.status(500).send(error);
    });
});

module.exports = {
    getScriptInfos: getScriptInfos, getLazyScriptInfos: getLazyScriptInfos
};
//# sourceMappingURL=scriptInfoSvc.js.map
