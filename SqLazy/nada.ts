/// <reference path='typings/angularjs/angular.d.ts' />

class LooksLikeAcontroller{
    constructor(private $q:ng.IQService,private $http:ng.IHttpService){

    }

    getMethod = (): ng.IPromise<void> => {
        var defer:ng.IDeferred<void> = this.$q.defer<void>();
        this.$http({ url: '/abc', method: "GET"}).then(
            payload => defer.resolve(),
                error=> defer.reject()
        );
        return defer.promise;
    }

}