/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../db.ts' />
/// <reference path='IServerInfoService.ts' />
/// <reference path='ServerInfoService.ts' />
/// <reference path='IServerInfoSearch' />
/// <reference path='../Idb.ts' />

var app = require('../../app');

var fty =require('./ServerInfoService');
var service:IServerInfoService = new fty();

var app = require('../../app');

function getServerInfo(quinfo:IServerInfoSearch, withResults:(results:IServerInfo[])=> void, withError?:(error:Error)=>void) {

    service.find(quinfo, (error, results)=> {
        if (error) {
            if (withError) {
                withError(error)
            } else throw error;
        }
        withResults(results)
    });
}

app.appRoute('/serverInfo/:name', (request, response)=> {
    var name = request.params.name;
    if(!name) response.send(new Error("Name Not Found"));
    var criteria = name ? {server: name} : {};
    getServerInfo(criteria,
        (results)=> { response.send(results);},
            error=> response.send(error));
});

app.appRoute('/serverInfo/:name/dbs', (request, response)=> {
    var name = request.params.name;
    if(!name) response.send(new Error("Name Not Found"));
    var criteria = name ? {server: name} : {};
    getServerInfo(criteria,
        (results)=> { response.send(results.map(server=>server.db));},
            error=> response.status(500).send(error));
});

app.appRoute('/serverInfo', (request, response)=> {
    service.findAll((error,results)=>{
        if(error) response.status(500).send(error);
        else response.send(results);
    })
});