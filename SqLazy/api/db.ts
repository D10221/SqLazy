/// <reference path='../typings/tsd.d.ts' />
/// <reference path='serverInfo/serverInfoDataStore' />
/// <reference path='IDataStore.ts' />
/// <reference path='serverInfo/IServerInfoService.ts' />

var serverInfoDataStore : IServerInfoService= require('./serverInfo/serverInfoDataStore');

module.exports = { serverInfo : serverInfoDataStore };



