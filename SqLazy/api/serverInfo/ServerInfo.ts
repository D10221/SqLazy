/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IServerInfo.ts' />

class ServerInfo implements IServerInfo{
    server: string;
    db: string ;
    connectionString: string;
    constructor(server: string, db: string , connectionString:string){
        this.server = server;
        this.db = db;
        this.connectionString = connectionString;
    }
}
exports.ServerInfo = ServerInfo;