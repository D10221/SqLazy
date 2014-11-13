/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IScriptInfo.ts' />
/// <reference path='IUScripts.ts' />
/// <reference path='../apiConfig.ts' />

var glob = require("glob");
var q = require('q');
var app = require('../../app');
var fs  = require('fs');
var _:UnderscoreStatic = require('underscore');
var apiConfig = require('../apiConfig');
var helpers = require('./helpers');

var log={
    error: (msg:string)=>{
        console.error( 'uscripts: '+msg )
    },info:(msg:string)=>{
        console.info( 'uscripts: '+msg )
    }
}

function getFiles(pattern) :Q.IPromise<string[]>{
    var deferred = q.defer();
    var files = glob.sync(pattern);
    deferred.resolve(files);
    return deferred.promise;
}


function readFileAsync(path:string)
/*returns*/:Q.IPromise<string>{
    var deferred:Q.Deferred<string> = q.defer();
    try {
        var filename = require.resolve(apiConfig.scriptsBase+path);
        var result = fs.readFileSync(filename, 'utf8');
        deferred.resolve(result);
    } catch (e) {
        log.error('Error: ' + e.message ) ;
       deferred.reject(e);
    }
    return deferred.promise;
}

app.appRoute('/uscripts/:year?/:month?', (request,response)=>{
    var pattern = helpers.getPattern(request);
    getFiles(pattern)
        .then(files=> response.send(files),
            error=> response.send(error))
});

module.exports = <IUScripts>{
    getFiles : getFiles,readFileAsync:readFileAsync
};