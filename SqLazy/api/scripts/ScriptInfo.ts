/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IScriptInfo.ts' />

class ScriptInfo implements  IScriptInfo{

    path: string;
    state: string;
    sql:string ;
    cmdType: string;
    cmdAction: string;

    constructor(config:{ state?:string;path?:string;cmdType?:string; cmdAction?:string; sql:string}){
        this.path= config.path || '';
        this.state= config.state || '';
        this.sql= config.sql;
        this.cmdType= config.cmdType || "Text";
        this.cmdAction= config.cmdAction || "ExecuteReader";
    }
}

module.exports = ScriptInfo;