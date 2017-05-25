var app = angular.module('optimizer', []);

app.controller('mainController', ['$http', function($http){
  this.message = "WORKS";
  this.players = [];
  this.QBs = [];
  this.WRs = [];
  this.RBs = [];
  this.TEs = [];
  this.Ds = [];
  this.showPlayers = 'QB';
  this.sortby = '-projection';


  this.setShow = function(position){
    this.showPlayers = position;
  };

  this.sortTableBy = function(sort){
    if(sort == 'projection' || sort == 'Salary' || sort == 'Value'){
      this.sortby = "-"+sort;
    }else {
      this.sortby = sort;
    }
  };

  var controller = this;
  $http({
    method: 'GET',
    url: 'http://localhost:3000/players',
  }).then(function(response){
    this.players = response.data;
    this.players.forEach(function(player){
      if(player.projection !== null){
        player.projection = parseFloat(player.projection);
      }else{
        player.projection = 0;
      }
      if(player.Position === 'QB'){
        controller.QBs.push(player);
      }else if (player.Position === 'WR') {
        controller.WRs.push(player);
      }else if (player.Position === 'RB') {
        controller.RBs.push(player);
      }else if (player.Position === 'TE') {
        controller.TEs.push(player);
      }else if (player.Position === 'DST') {
        controller.Ds.push(player);
      }
    });
  }.bind(this));

}]);
