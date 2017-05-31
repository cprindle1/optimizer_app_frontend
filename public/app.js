const app = angular.module('optimizer', ['ngStorage']);

app.controller('mainController', function($http, $scope, $localStorage){
  $scope.$storage = $localStorage.$default({
    aboutModal: false,
    players: [],
    showPlayers: 'QB',
    sortby: '-projection',
    lastSort: '-projection',
    sortAsc: false,
    sortCategory: 'projection',
    removedPlayers: [],
    times: [],
    teams: []
  });

  this.setShow = function(position){
    $localStorage.showPlayers = position;
  };

  this.removeTeam = function(name){
    for(let i=$localStorage.players.length-1; i>=0; i--){
      if($localStorage.players[i].team==name){
        this.removePlayer($localStorage.players[i], $localStorage.players[i].Position);
      }
    }
  };

  this.replaceTeam = function(name){
    for(let i=$localStorage.removedPlayers.length-1; i>=0; i--){
      if($localStorage.removedPlayers[i].team==name){
        this.addPlayer($localStorage.removedPlayers[i]);
      }
    }
  };

  this.removeTime = function(time){
    for(let i=$localStorage.players.length-1; i>=0; i--){
      if($localStorage.players[i].gameTime==time){
        this.removePlayer($localStorage.players[i], $localStorage.players[i].Position);
      }
    }
  };

  this.replaceTime = function(time){
    for(let i=$localStorage.removedPlayers.length-1; i>=0; i--){
      if($localStorage.removedPlayers[i].gameTime==time){
        this.addPlayer($localStorage.removedPlayers[i]);
      }
    }
  };
  $scope.toggleX = function (x) {
    x.toggled = !x.toggled;
  };

  this.removePlayer = function(player, position){
    console.log(position);
    $localStorage.removedPlayers.push(player);
    function findPlayer(p){
      return p.id == player.id;
    }
    $localStorage.players.splice($localStorage.players.indexOf($localStorage.players.find(findPlayer)),1);
  };

  this.addAll = function(){
    for(let i=0; i<$localStorage.times.length; i++){
        $localStorage.times[i].toggled = false;
    }
    for(let i=0; i<$localStorage.teams.length; i++){
        $localStorage.teams[i].toggled = false;
    }
    for(let i=$localStorage.removedPlayers.length-1; i>=0; i--){
        $localStorage.players.push($localStorage.removedPlayers[i]);
        $localStorage.removedPlayers.splice(i,1);
    }

  }

  this.addPlayer = function(player){
    for(let i=0; i<$localStorage.times.length; i++){
      if(player.gameTime == $localStorage.times[i].time && $localStorage.times[i].toggled){
        $localStorage.times[i].toggled = !$localStorage.times[i].toggled;
      }
    }
    for(let i=0; i<$localStorage.teams.length; i++){
      if(player.team == $localStorage.teams[i].name && $localStorage.teams[i].toggled){
        console.log($localStorage.teams[i]);
        $localStorage.teams[i].toggled = !$localStorage.teams[i].toggled;
      }
    }
    function findPlayer(p){
      return p.id == player.id;
    }
    $localStorage.removedPlayers.splice($localStorage.removedPlayers.indexOf($localStorage.removedPlayers.find(findPlayer)),1);
      $localStorage.players.push(player);
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
    // url: 'http://localhost:3000/players',
    url: 'https://optimizerapi.herokuapp.com/players',

  }).then(function(response){
    if($localStorage.players.length !== 0){
      //check for updates
    }else{
      $localStorage.players = response.data;
      $localStorage.players.forEach(function(player){
        let timeFound = false;
        if($localStorage.times.length == 0){
          newTime = {time: player.gameTime, toggled: false}
          $localStorage.times.push(newTime);
        }else{
          for(let i = 0; i<$localStorage.times.length; i++){
            if($localStorage.times[i].time===player.gameTime){
              timeFound = true;
            }
          }
          if(!timeFound){
            newTime = {time: player.gameTime, toggled: false};
            $localStorage.times.push(newTime);          }
        }
        let teamFound = false;
        if($localStorage.teams.length == 0){
          newTeam = {name: player.team, toggled: false}
          $localStorage.teams.push(newTeam);
        }else{
          for(let i = 0; i<$localStorage.teams.length; i++){
            if($localStorage.teams[i].name===player.team){
              teamFound = true;
            }
          }
          if(!teamFound){
            newTeam = {name: player.team, toggled: false}
            $localStorage.teams.push(newTeam);
         }
        }
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
      });
    }
  });
  $localStorage.teams.sort();
});
