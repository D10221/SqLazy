/// <reference path='../../typings/tsd.d.ts' />
interface IUScripts{
    getFiles(pattern) :Q.IPromise<string[]>;
    readFileAsync(path:string)
        /*returns*/:Q.IPromise<string>;
}