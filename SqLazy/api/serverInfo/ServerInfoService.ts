/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='ServerInfo.ts' />
/// <reference path='../IDataStore.ts' />
/// <reference path='IServerInfoService.ts' />
/// <reference path='IServerInfoSearch.ts' />

var servers:IDataStore<IServerInfo> = require('./serverInfoDataStore');
var q = require('q');

class ServerInfoService implements IServerInfoService {

    servers:IDataStore<ServerInfo>;

    findAll(callback:(error:Error, data:IServerInfo[])=>void) {
        // Find all documents in the collection
        //db.find({}, function (err, docs) {});
        servers.find({}, callback);
    }

    findOne(aQuery:{}, callback:(err, doc)=>void) {
        servers.findOne(aQuery, callback)
    }

    OnEmpty(onEmpty:(x:IDataStore<IServerInfo>) => void, onError?:(xerror:Error, xstore:IDataStore<IServerInfo>) =>void) {
        this.findAll((error, result)=> {
            if (error) {
                if (onError) {
                    onError(error, servers)
                } else throw error;
            }
            if (result.length === 0) onEmpty(servers);
        })
    }

    find(aQuery:{}, callback:(error:Error, data:IServerInfo[])=>void) {
        servers.find(aQuery, callback);
    }

    findOneAsync(aQuery:IServerInfoSearch):Q.IPromise<IServerInfo> {
        var deferred = q.defer();
        servers.findOne(aQuery, (error,data)=>{
            if(error) {
                deferred.reject(error);
                return;
            }
            deferred.resolve(data);
        });
        return deferred.promise;
    }
}

module.exports = ServerInfoService;