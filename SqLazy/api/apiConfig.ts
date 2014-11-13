/// <reference path='../typings/tsd.d.ts' />
//var base = 'C:/Dev/SystemA/UpdateScripts/';
var base = 'C:/Dev/templates/SqLazy/SqLazy/uscripts/';
var scriptsBase = "";

interface IApiConfig{
    base: string;
    scriptsBase:string;
}

module.exports = <IApiConfig>{
    base: base, scriptsBase:scriptsBase
}
