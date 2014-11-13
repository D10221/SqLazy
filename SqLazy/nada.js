/// <reference path='typings/angularjs/angular.d.ts' />
var LooksLikeAcontroller = (function () {
    function LooksLikeAcontroller($q, $http) {
        var _this = this;
        this.$q = $q;
        this.$http = $http;
        this.getMethod = function () {
            var defer = _this.$q.defer();
            _this.$http({ url: '/abc', method: "GET" }).then(function (payload) {
                return defer.resolve();
            }, function (error) {
                return defer.reject();
            });
            return defer.promise;
        };
    }
    return LooksLikeAcontroller;
})();
