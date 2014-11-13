/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='./INetQueryCmd.ts' />
/// <reference path='../serverInfo/IServerInfo.ts' />
/// <reference path='../scripts/IScriptInfo.ts' />

interface INetQuery{
    NetQueyCmd(serverInfoP:Q.IPromise<IServerInfo>,
               scriptInfoP?:Q.IPromise<IScriptInfo>)/*returns*/:Q.IPromise<INetQueryCmd>;
}
