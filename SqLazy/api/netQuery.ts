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
var srvInfoSvc:IServerInfoService = new ServerInfoService();
var scriptInfoSvc :IScriptInfoService = require('./scripts/scriptInfoSvc');
var app = require('../app');
var helper = require('./scripts/helpers');
var _ : UnderscoreStatic= require('underscore');
function asPromise<T>(data:T):Q.IPromise<T>{
    var defer = q.defer();
    defer.resolve(data);
    return defer.promise;
}

function logError(err) {
    console.log("Error:" + err);
}

function NetQueyCmd(serverInfoP:Q.IPromise<IServerInfo>,
                    scriptInfoP?:Q.IPromise<IScriptInfo>)/*returns*/:Q.IPromise<INetQueryCmd> {

    var deferred = q.defer();

    q.all([serverInfoP, scriptInfoP]).then(
            results=> {
            var serverInfo:IServerInfo = results[0];
            var scriptInfo:IScriptInfo = results[1];
            deferred.resolve(<INetQueryCmd>{
                target: <ISqlTarget> {
                    server: serverInfo.server, db: serverInfo.db
                },
                cmd: <ISqlCmd> {
                    sql: scriptInfo.sql,
                    cmdType: scriptInfo.cmdType,
                    cmdAction: scriptInfo.cmdAction,
                    connectionString: serverInfo.connectionString
                }
            })
        },
            errors => deferred.reject(new Error('Unable to GetNetQUeryCmd'))
    );

    return deferred.promise;
}

var execSql = edge.func({
    assemblyFile: dll,
    typeName: 'Node2SqlBridge.Bridge',
    methodName: 'Invoke'
});


function GetServerInfo(search:IServerInfoSearch):Q.IPromise<IServerInfo> {
    var deferred = q.defer();

    srvInfoSvc.find(search, (error, results)=> {

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

function runScript(server,db,scriptInfoPromise:Q.IPromise<IScriptInfo>) {

    var deferred = q.defer();

    var serverInfoPromise = GetServerInfo(
        {server: server, db: db}
    );

    var promise = NetQueyCmd(serverInfoPromise, scriptInfoPromise);

    promise.then(
            nqCmd=> {
            execSql(nqCmd.cmd, (error, result) => {
                if (error) {
                    logError(error);
                    deferred.reject(error);
                }
                console.info('Sql Exec Completed Ok');
                deferred.resolve(result );
            });
        },
            error => deferred.reject(error)
    );

    return deferred.promise;
}

//Asume ?query='a sql query'
app.appRoute('/sql/:server/:db', (request,response)=>{
    var parameters = request.params;
    var server = parameters.server;
    var db = parameters.db;

    var parts = url.parse(request.url, true);
    var urlQuery = parts.query;

    var scriptInfo = new ScriptInfo({
            cmdType: urlQuery.cmdType,
            cmdAction: "ExecuteReader",
            sql: urlQuery.query}
    );

    runScript(server,db,asPromise(scriptInfo)).then(
        result=> response.send( result),
        error => response.send(error)
    )
});

//Run all found
app.appRoute('/sql/:server/:db/:year/:month?', (request,response)=>{

    var parameters = request.params;
    var server = parameters.server;
    var db = parameters.db;
    var pattern = helper.getPattern(request);

    var promises = scriptInfoSvc.getScriptInfos(pattern).then(
        scriptInfos=>
            scriptInfos.map(scriptInfo=>{
                return runScript(server,db,asPromise(scriptInfo));
            })
        ,
        error => response.send(error)
    );
    q.all(promises).then(results=>response.send( results),error=> response.send(error));
});

//Run 1st found
app.appRoute('/sql/:server/:db/:year/:month?/first', (request,response)=>{

    var parameters = request.params;
    var server = parameters.server;
    var db = parameters.db;
    var pattern = helper.getPattern(request);
    var parts = url.parse(request.url, true);
    var name = parts.query.name ;

    var deferredScriptInfo = q.defer();
    scriptInfoSvc.getScriptInfos(pattern).then(
        scriptInfos=>  {
            if(name){
                var found = _.find(scriptInfos,script=> (new RegExp(name).test(script.path)));
                if(found) {
                    console.info('Name matched: ' + name);
                    deferredScriptInfo.resolve(found);
                    return;
                }
                deferredScriptInfo.reject(new Error('Script Not Found'));
                 return;
            };
            var scriptInfo = scriptInfos[0];
            deferredScriptInfo.resolve(scriptInfo)
        },
        error => deferredScriptInfo.reject(error)
    );

    runScript(server,db,deferredScriptInfo.promise).then(
            result=> response.send( result),
            error => response.send(error)
    )

});

module.exports = <INetQuery>{
    NetQueyCmd : NetQueyCmd
};
