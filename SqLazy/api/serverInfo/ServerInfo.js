/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IServerInfo.ts' />
var ServerInfo = (function () {
    function ServerInfo(server, db, connectionString) {
        this.server = server;
        this.db = db;
        this.connectionString = connectionString;
    }
    return ServerInfo;
})();
exports.ServerInfo = ServerInfo;
//# sourceMappingURL=ServerInfo.js.map
