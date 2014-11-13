/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='ServerInfo.ts' />
/// <reference path='../IDataStore.ts' />
/// <reference path='IServerInfoService.ts' />
/// <reference path='IServerInfoSearch.ts' />
var servers = require('./serverInfoDataStore');
var q = require('q');

var ServerInfoService = (function () {
    function ServerInfoService() {
    }
    ServerInfoService.prototype.findAll = function (callback) {
        // Find all documents in the collection
        //db.find({}, function (err, docs) {});
        servers.find({}, callback);
    };

    ServerInfoService.prototype.findOne = function (aQuery, callback) {
        servers.findOne(aQuery, callback);
    };

    ServerInfoService.prototype.OnEmpty = function (onEmpty, onError) {
        this.findAll(function (error, result) {
            if (error) {
                if (onError) {
                    onError(error, servers);
                } else
                    throw error;
            }
            if (result.length === 0)
                onEmpty(servers);
        });
    };

    ServerInfoService.prototype.find = function (aQuery, callback) {
        servers.find(aQuery, callback);
    };

    ServerInfoService.prototype.findOneAsync = function (aQuery) {
        var deferred = q.defer();
        servers.findOne(aQuery, function (error, data) {
            if (error) {
                deferred.reject(error);
                return;
            }
            deferred.resolve(data);
        });
        return deferred.promise;
    };
    return ServerInfoService;
})();

module.exports = ServerInfoService;
//# sourceMappingURL=ServerInfoService.js.map
