/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IScriptInfo.ts' />

interface IScriptInfoService{
    /**
     * straight sql: prop is text as sql, if too many or too big maight crash  the command
     * @param pattern
     */
    getScriptInfos(pattern) :Q.IPromise<IScriptInfo[]>;
    /**
     * the sql property return on each IscriptInfo is a
     * function that returns  IPromise<Text>
     * @param pattern
     */
    getLazyScriptInfos(pattern) :Q.IPromise<IScriptInfo[]>;
}