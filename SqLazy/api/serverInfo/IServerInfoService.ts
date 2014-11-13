/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='serverInfoDataStore' />
/// <reference path='../IDataStore.ts' />
/// <reference path='IServerInfoSearch' />

interface IServerInfoService{
    servers : IDataStore<ServerInfo>;
    findAll: (callback:(error:Error, data: IServerInfo[])=>void)=>void ;
    findOne: (aQuery:{}, callback:(err, doc)=>void)=>void;
    findOneAsync(aQuery:IServerInfoSearch):Q.IPromise<IServerInfo>;
    find:(aQuery:{},callback:(error:Error, data:IServerInfo[])=>void)=>void;
}