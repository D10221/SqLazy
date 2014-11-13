var app = angular.module('sqlazy', []);
app.controller('AppCtrl', [
    '$scope','$http', function($scope,$http) {
        $scope.result = {data: {}};
            $http.get('http://localhost:3000/sql?query=select * from status').then(
            function(payload) {
                $scope.result ={data:  payload.data}; 
            }
        );
    }
]);
