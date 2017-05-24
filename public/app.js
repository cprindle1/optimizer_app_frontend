var app = angular.module('optimizer', []);

app.controller('mainController', ['$http', function($http){
  this.message = "WORKS";

$http({
  method: 'GET',
  url: 'http://localhost:3000/players',
}).then(function(response) {
  console.log(response);
});

}]);
