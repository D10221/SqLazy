/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IScriptInfo.ts' />
/// <reference path='IScriptInfoService.ts' />
/// <reference path='IUScripts.ts' />
/// <reference path='ScriptInfo.ts' />
/// <reference path='IUScripts.ts' />

var q = require('q');
var app = require('../../app');
var fs  = require('fs');
var _:UnderscoreStatic = require('underscore');
var uscripts:IUScripts = require("./uscripts");
var helper = require('./helpers');
var scriptInfo = require('./ScriptInfo');
var url = require('url');
var fty = function(config){
    return new scriptInfo(config);
}

var log = {
       info: msg => console.info(this.name + msg),
   error: msg=> console.error(this.name + msg)
}

function toScriptInfo(paths){
       return paths.map(
            path=> fty({path: path, sql: '*'}));
}

function getLazyScriptInfos(pattern) :Q.IPromise<IScriptInfo[]>{
   return  uscripts.getFiles(pattern)
        .then(paths=> paths.map(
               path=> fty({path: path, sql: ()=>{
                   var deferredText = q.defer();
                   uscripts.readFileAsync(path).then(text=>{
                       deferredText.resolve(new ScriptInfo({path: path, sql:text}));
                   },error=> deferredText.reject(error));
                   return deferredText.promise;
               }})));
}

function getScriptInfos(pattern) :Q.IPromise<IScriptInfo[]>{
    var scriptInfos:Q.Deferred<IScriptInfo[]> = q.defer();
    uscripts.getFiles(pattern)
        .then(paths=> {
            console.log('Got Paths');
            var promises:Q.IPromise<any>[] =
                paths.map(path=> uscripts.readFileAsync(path).then(text=> {return {
                    path: path, state : '?' , sql:text, cmdAction: 'ExecuteReader', cmdType: 'Text'
                }}));
            q.all(promises).then(
                    all=> {
                    var result = all.map( x=> x );
                    console.log('delivering %d results', result.length);
                    scriptInfos.resolve(result);
                },
                /*all*/ errors=> scriptInfos.reject(new Error('getScriptInfos: Failed'))
            );
        },/*paths*/ error=> scriptInfos.reject(error));
    return scriptInfos.promise;
}

app.appRoute('/scriptInfo/:year?/:month?/lazy', (request, response)=> {
    var pattern = helper.getPattern(request);
    getLazyScriptInfos(pattern).then(result=>
            response.send(result),
            error=> response.status(500).send(error)
    )
});

app.appRoute('/scriptInfo/:year?/:month?', (request, response)=> {

    var pattern = helper.getPattern(request);
    var parts = url.parse(request.url,true);
    if(parts.name){
        pattern = pattern.replace(/\*\.sql/,parts.name);
    }

    getScriptInfos(pattern).then(result=>
            response.send(result),
            error=> response.status(500).send(error)
    )
});

module.exports = <IScriptInfoService>{
    getScriptInfos : getScriptInfos,getLazyScriptInfos:getLazyScriptInfos
};