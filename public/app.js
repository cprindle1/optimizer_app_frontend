const app = angular.module('optimizer', ['ngStorage']);

app.controller('mainController', function($http, $scope, $localStorage){
  $scope.$storage = $localStorage.$default({
    aboutModal: false,
    players: [],
    QBs: [],
    WRs: [],
    RBs: [],
    TEs: [],
    Ds: [],
    showPlayers: 'QB',
    sortby: '-projection',
    lastSort: '-projection',
    sortAsc: false,
    sortCategory: 'projection',
    removedPlayers: []
  });

  this.setShow = function(position){
    $localStorage.showPlayers = position;
  };

  this.removePlayer = function(player, position){
    console.log(player);
    $localStorage.removedPlayers.push(player);
    function findPlayer(p){
      return p.id == player.id;
    }
    if(position == 'QB'){
      $localStorage.QBs.splice($localStorage.QBs.indexOf($localStorage.QBs.find(findPlayer)),1);
    }else if (position == 'RB') {
      $localStorage.RBs.splice($localStorage.RBs.indexOf($localStorage.RBs.find(findPlayer)),1);
    }else if (position == 'WR') {
      $localStorage.WRs.splice($localStorage.WRs.indexOf($localStorage.WRs.find(findPlayer)),1);
    }else if (position == 'TE') {
      $localStorage.TEs.splice($localStorage.TEs.indexOf($localStorage.TEs.find(findPlayer)),1);
    }else if (position == 'D') {
      $localStorage.Ds.splice($localStorage.Ds.indexOf($localStorage.Ds.find(findPlayer)),1);
    }
    console.log($localStorage.removedPlayers);
  };

  this.addPlayer = function(player){
    console.log(player);
    function findPlayer(p){
      return p.id == player.id;
    }
    $localStorage.removedPlayers.splice($localStorage.removedPlayers.indexOf($localStorage.removedPlayers.find(findPlayer)),1);
    if(player.Position == 'QB'){
      $localStorage.QBs.push(player);
    }else if (player.Position == 'RB') {
      $localStorage.RBs.push(player);
    }else if (player.Position == 'WR') {
      $localStorage.WRs.push(player);
    }else if (player.Position == 'TE') {
      $localStorage.TEs.push(player);
    }else if (player.Position == 'DST') {
      $localStorage.Ds.push(player);
    }
  };

  this.sortTableBy = function(sort){
    if($localStorage.lastSort == sort){
      $localStorage.sortby = sort;
      $localStorage.sortAsc = true;
      $localStorage.lastSort = '-'+sort;
      $localStorage.sortCategory = sort.replace('-', '');
    }else {
      $localStorage.sortby = '-'+sort;
      $localStorage.sortAsc = false;
      $localStorage.lastSort = sort;
      $localStorage.sortCategory = sort;
      $localStorage.sortCategory = sort;
    }
  };
  $http({
    method: 'GET',
    url: 'http://localhost:3000/players',
  }).then(function(response){
    console.log($localStorage.players.length);
    if($localStorage.players.length !== 0){
      console.log("in local already");
      //need to update local
    }else{
    $localStorage.players = response.data;
    console.log($localStorage.players);
    $localStorage.players.forEach(function(player){
      if(player.projection !== null){
        player.projection = parseFloat(player.projection);
      }else{
        player.projection = 0;
      }
      if(player.Value !== null){
        player.Value = parseFloat(player.Value);
      }else{
        player.Value = 0;
      }
      if(player.Position === 'QB'){
        $localStorage.QBs.push(player);
      }else if (player.Position === 'WR') {
        $localStorage.WRs.push(player);
      }else if (player.Position === 'RB') {
        $localStorage.RBs.push(player);
      }else if (player.Position === 'TE') {
        $localStorage.TEs.push(player);
      }else if (player.Position === 'DST') {
        $localStorage.Ds.push(player);
      }
    });
  }
  });

});
