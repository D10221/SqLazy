/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='IScriptInfo.ts' />
var ScriptInfo = (function () {
    function ScriptInfo(config) {
        this.path = config.path || '';
        this.state = config.state || '';
        this.sql = config.sql;
        this.cmdType = config.cmdType || "Text";
        this.cmdAction = config.cmdAction || "ExecuteReader";
    }
    return ScriptInfo;
})();

module.exports = ScriptInfo;
//# sourceMappingURL=ScriptInfo.js.map
