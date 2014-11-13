/// <reference path='../typings/tsd.d.ts' />
/// <reference path='db.ts' />
/// <reference path='scripts/IScriptInfo.ts' />
/// <reference path='./nQuery/ISqlCmd' />
/// <reference path='./nQuery/ISqlTarget.ts' />
/// <reference path='./nQuery/INetQueryCmd.ts' />
/// <reference path='./nQuery/INetQuery.ts' />
/// <reference path='./serverInfo/IServerInfoSearch' />
/// <reference path='./scripts/IScriptInfoService.ts' />
/// <reference path='./scripts/ScriptInfo.ts' />
var edge = require('edge');
var url = require('url');
var dll = require('path').join(__dirname, '../bin/debug/Node2SqlBridge.dll');
var q = require('q');
var ServerInfoService = require('./serverInfo/ServerInfoService');
var srvInfoSvc = new ServerInfoService();
var scriptInfoSvc = require('./scripts/scriptInfoSvc');
var app = require('../app');
var helper = require('./scripts/helpers');
var _ = require('underscore');
function asPromise(data) {
    var defer = q.defer();
    defer.resolve(data);
    return defer.promise;
}

function logError(err) {
    console.log("Error:" + err);
}

function NetQueyCmd(serverInfoP, scriptInfoP) {
    var deferred = q.defer();

    q.all([serverInfoP, scriptInfoP]).then(function (results) {
        var serverInfo = results[0];
        var scriptInfo = results[1];
        deferred.resolve({
            target: {
                server: serverInfo.server, db: serverInfo.db
            },
            cmd: {
                sql: scriptInfo.sql,
                cmdType: scriptInfo.cmdType,
                cmdAction: scriptInfo.cmdAction,
                connectionString: serverInfo.connectionString
            }
        });
    }, function (errors) {
        return deferred.reject(new Error('Unable to GetNetQUeryCmd'));
    });

    return deferred.promise;
}

var execSql = edge.func({
    assemblyFile: dll,
    typeName: 'Node2SqlBridge.Bridge',
    methodName: 'Invoke'
});

function GetServerInfo(search) {
    var deferred = q.defer();

    srvInfoSvc.find(search, function (error, results) {
        if (error) {
            throw deferred.reject(error);
        }

        var result = results[0];
        if (!result || result === {}) {
            deferred.reject(new Error('Server Info not found'));
        }

        deferred.resolve(result);
    });

    return deferred.promise;
}

function runScript(server, db, scriptInfoPromise) {
    var deferred = q.defer();

    var serverInfoPromise = GetServerInfo({ server: server, db: db });

    var promise = NetQueyCmd(serverInfoPromise, scriptInfoPromise);

    promise.then(function (nqCmd) {
        execSql(nqCmd.cmd, function (error, result) {
            if (error) {
                logError(error);
                deferred.reject(error);
            }
            console.info('Sql Exec Completed Ok');
            deferred.resolve(result);
        });
    }, function (error) {
        return deferred.reject(error);
    });

    return deferred.promise;
}

//Asume ?query='a sql query'
app.appRoute('/sql/:server/:db', function (request, response) {
    var parameters = request.params;
    var server = parameters.server;
    var db = parameters.db;

    var parts = url.parse(request.url, true);
    var urlQuery = parts.query;

    var scriptInfo = new ScriptInfo({
        cmdType: urlQuery.cmdType,
        cmdAction: "ExecuteReader",
        sql: urlQuery.query });

    runScript(server, db, asPromise(scriptInfo)).then(function (result) {
        return response.send(result);
    }, function (error) {
        return response.send(error);
    });
});

//Run all found
app.appRoute('/sql/:server/:db/:year/:month?', function (request, response) {
    var parameters = request.params;
    var server = parameters.server;
    var db = parameters.db;
    var pattern = helper.getPattern(request);

    var promises = scriptInfoSvc.getScriptInfos(pattern).then(function (scriptInfos) {
        return scriptInfos.map(function (scriptInfo) {
            return runScript(server, db, asPromise(scriptInfo));
        });
    }, function (error) {
        return response.send(error);
    });
    q.all(promises).then(function (results) {
        return response.send(results);
    }, function (error) {
        return response.send(error);
    });
});

//Run 1st found
app.appRoute('/sql/:server/:db/:year/:month?/first', function (request, response) {
    var parameters = request.params;
    var server = parameters.server;
    var db = parameters.db;
    var pattern = helper.getPattern(request);
    var parts = url.parse(request.url, true);
    var name = parts.query.name;

    var deferredScriptInfo = q.defer();
    scriptInfoSvc.getScriptInfos(pattern).then(function (scriptInfos) {
        if (name) {
            var found = _.find(scriptInfos, function (script) {
                return (new RegExp(name).test(script.path));
            });
            if (found) {
                console.info('Name matched: ' + name);
                deferredScriptInfo.resolve(found);
                return;
            }
            deferredScriptInfo.reject(new Error('Script Not Found'));
            return;
        }
        ;
        var scriptInfo = scriptInfos[0];
        deferredScriptInfo.resolve(scriptInfo);
    }, function (error) {
        return deferredScriptInfo.reject(error);
    });

    runScript(server, db, deferredScriptInfo.promise).then(function (result) {
        return response.send(result);
    }, function (error) {
        return response.send(error);
    });
});

module.exports = {
    NetQueyCmd: NetQueyCmd
};
//# sourceMappingURL=netQuery.js.map
