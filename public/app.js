const app = angular.module('optimizer', ['ngStorage', 'ngAnimate']);

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
    teams: [],
    lineups: []
  });
  this.optimized = false;
  this.QBs = [];
  this.RBs = [];
  this.WRs = [];
  this.TEs = [];
  this.Fs = [];
  this.Ds = [];
  this.tempLineup = [];
  this.totalProjection = 0;
  this.totalBudget = 0;

  this.closeOptimized = function(){
    this.optimized=false;
  }

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
    $localStorage.removedPlayers.push(player);
    function findPlayer(p){
      return p.id == player.id;
    }
    $localStorage.players.splice($localStorage.players.indexOf($localStorage.players.find(findPlayer)),1);
    this.optimize();
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
    this.optimize();
  }

  this.addPlayer = function(player){
    for(let i=0; i<$localStorage.times.length; i++){
      if(player.gameTime == $localStorage.times[i].time && $localStorage.times[i].toggled){
        $localStorage.times[i].toggled = !$localStorage.times[i].toggled;
      }
    }
    for(let i=0; i<$localStorage.teams.length; i++){
      if(player.team == $localStorage.teams[i].name && $localStorage.teams[i].toggled){
        $localStorage.teams[i].toggled = !$localStorage.teams[i].toggled;
      }
    }
    function findPlayer(p){
      return p.id == player.id;
    }
    $localStorage.removedPlayers.splice($localStorage.removedPlayers.indexOf($localStorage.removedPlayers.find(findPlayer)),1);
    $localStorage.players.push(player);
    this.optimize();
  };


  this.checkBudget = function(lineup){
    let budget = 0;
    for(let i=0; i<lineup.length; i++){
      budget+=parseInt(lineup[i].Salary);
    }
    this.totalBudget = budget;
    return (budget<=50000);
  };

  this.findReplacement = function(positionArray, pos){
    for(let a=positionArray.length-1; a>=0; a--){
      if(parseInt(positionArray[a].Salary) < parseInt(this.tempLineup[pos].Salary)){
        return positionArray[a];
        break;
      }
    }
    return this.tempLineup[pos];
  };

  this.findBestReplacement = function(replacements){
    let replacementValues = [];
    let maxRV = 0;
    let replacementIndex = 0;
    for(let i=0; i<replacements.length; i++){
      replacementValues.push((parseFloat(this.tempLineup[i].Salary)-parseFloat(replacements[i].Salary))/((parseFloat(this.tempLineup[i].projection)-parseFloat(replacements[i].projection))+1));
    }
    for(let i=0; i<replacementValues.length; i++){
      if(replacementValues[i]>maxRV){
        maxRV = replacementValues[i];
        replacementIndex = i;
      }
    }
    return(replacementIndex);
  };

  this.replacePlayer = function(i, replacements){

    let compare = function(a, b){
      return a.projection - b.projection;
    };

    if(this.tempLineup[i].Position == 'QB'){
      this.QBs.push(this.tempLineup[i]);
      this.QBs.sort(compare);
    }else if(this.tempLineup[i].Position == 'RB'){
      this.RBs.push(this.tempLineup[i]);
      this.RBs.sort(compare);
    }else if(this.tempLineup[i].Position == 'WR'){
      this.WRs.push(this.tempLineup[i]);
      this.WRs.sort(compare);
    }else if(this.tempLineup[i].Position == 'TE'){
      this.TEs.push(this.tempLineup[i]);
      this.TEs.sort(compare);
    }else if(this.tempLineup[i].Position == 'DST'){
      this.Ds.push(this.tempLineup[i]);
      this.Ds.sort(compare);
    }
    if(this.tempLineup.Position != 'QB' && this.tempLineup.Position != 'DST'){
      this.Fs.push(this.tempLineup[i]);
      this.Fs.sort(compare);
    }

    this.tempLineup[i] = replacements[i];


    if(replacements[i].Position == 'QB'){
      for(let j = 0; j<this.QBs.length; j++){
        if(replacements[i] == this.QBs[j]){
          this.QBs.splice(j,1);
          break;
        }
      }
    }else if(replacements[i].Position == 'RB'){
      for(let j = 0; j<this.RBs.length; j++){
        if(replacements[i] == this.RBs[j]){
          this.RBs.splice(j,1);
          break;
        }
      }
    }else if(replacements[i].Position == 'WR'){
      for(let j = 0; j<this.WRs.length; j++){
        if(replacements[i] == this.WRs[j]){
          this.WRs.splice(j,1);
          break;
        }
      }
    }else if(replacements[i].Position == 'TE'){
      for(let j = 0; j<this.TEs.length; j++){
        if(replacements[i] == this.TEs[j]){
          this.TEs.splice(j,1);
          break;
        }
      }
    }else if(replacements[i].Position == 'DST'){
      for(let j = 0; j<this.Ds.length; j++){
        if(replacements[i] == this.Ds[j]){
          this.Ds.splice(j,1);
          break;
        }
      }
    }
    if(replacements[i].Position != 'QB' && replacements[i].Position != 'DST'){
      for(let j = 0; j<this.Fs.length; j++){
        if(replacements[i] == this.Fs[j]){
          this.Fs.splice(j,1);
          break;
        }
      }
    }
  };

  this.replaceOne = function(){
    let replacements = [];
    replacements.push(this.findReplacement(this.QBs, 0));
    replacements.push(this.findReplacement(this.RBs, 1));
    replacements.push(this.findReplacement(this.RBs, 2));
    replacements.push(this.findReplacement(this.WRs, 3));
    replacements.push(this.findReplacement(this.WRs, 4));
    replacements.push(this.findReplacement(this.WRs, 5));
    replacements.push(this.findReplacement(this.TEs, 6));
    replacements.push(this.findReplacement(this.Ds, 7));
    replacements.push(this.findReplacement(this.Fs, 8));
    this.replacePlayer(this.findBestReplacement(replacements), replacements);
  };

  this.optimize = function(){
    this.QBs = [];
    this.RBs = [];
    this.WRs = [];
    this.TEs = [];
    this.Ds = [];
    this.Fs = [];
    this.tempLineup= [];
    this.totalProjection = 0;
    this.totalBudget = 0;
    this.optimizeError = false;



    for(let i=0; i<$localStorage.players.length; i++){
      if($localStorage.players[i].Position == 'QB' && parseFloat($localStorage.players[i].projection) > 0){
        this.QBs.push($localStorage.players[i]);
      }else if($localStorage.players[i].Position == 'RB' && parseFloat($localStorage.players[i].projection) > 0){
        this.RBs.push($localStorage.players[i]);
      }else if($localStorage.players[i].Position == 'WR' && parseFloat($localStorage.players[i].projection) > 0){
        this.WRs.push($localStorage.players[i]);
      }else if($localStorage.players[i].Position == 'TE' && parseFloat($localStorage.players[i].projection) > 0){
        this.TEs.push($localStorage.players[i]);
      }else if($localStorage.players[i].Position == 'DST' && parseFloat($localStorage.players[i].projection) > 0){
        this.Ds.push($localStorage.players[i]);
      }
      if($localStorage.players[i].Position !== 'QB' && $localStorage.players[i].Position !== 'DST' && parseFloat($localStorage.players[i].projection) > 0){
        this.Fs.push($localStorage.players[i]);
      }
    }

    if(this.QBs.length > 0 && this.RBs.length > 0 && this.WRs.length > 0 && this.TEs.length > 0 && this.Ds.length > 0 && this.Fs.length > 0){

    let compare = function(a, b){
      return a.projection - b.projection;
    };
    this.QBs.sort(compare);
    this.RBs.sort(compare);
    this.WRs.sort(compare);
    this.TEs.sort(compare);
    this.Fs.sort(compare);
    this.Ds.sort(compare);
    this.tempLineup.push(this.QBs[this.QBs.length-1]);
    this.QBs.pop();
    this.tempLineup.push(this.RBs[this.RBs.length-1]);
    this.RBs.pop();
    this.tempLineup.push(this.RBs[this.RBs.length-1]);
    this.RBs.pop();
    this.tempLineup.push(this.WRs[this.WRs.length-1]);
    this.WRs.pop();
    this.tempLineup.push(this.WRs[this.WRs.length-1]);
    this.WRs.pop();
    this.tempLineup.push(this.WRs[this.WRs.length-1]);
    this.WRs.pop();
    this.tempLineup.push(this.TEs[this.TEs.length-1]);
    this.TEs.pop();
    this.tempLineup.push(this.Ds[this.Ds.length-1]);
    this.Ds.pop();
    for(let i=this.Fs.length-1; i>=0; i--){
      let found = false;
      for(let j=this.tempLineup.length-1; j>=0; j--){
        if(this.Fs[i].id == this.tempLineup[j].id){
          found = true;
          this.Fs.splice(i,1);
          break;
        }
      }
      if(!found){
        this.tempLineup.push(this.Fs[i]);
        let player = this.Fs[i]
        this.Fs.splice(i,1);
        function findPlayer(p){
          return p.id == player;
        }
        if(player.Position == 'RB'){
          this.RBs.splice(this.RBs.indexOf(this.RBs.find(findPlayer)),1);
        }else if(player.Position == 'WR'){
          this.WRs.splice(this.WRs.indexOf(this.WRs.find(findPlayer)),1);
        }else if(player.Position == 'TE'){
          this.TEs.splice(this.TEs.indexOf(this.TEs.find(findPlayer)),1);
        }
        break;
      }
    }
    // let looped = 0;
    while(!this.checkBudget(this.tempLineup)){
      this.replaceOne();
      // looped++;
      // if(looped>10){
      //   break;
      // }
    }
    for(let i=0; i<this.tempLineup.length; i++){
      this.totalProjection+=this.tempLineup[i].projection;
    }

    this.flex = this.tempLineup[8];
    // this.flex.Position = 'Flex';
    this.tempLineup[8] = this.tempLineup[7];
    this.tempLineup[7] = this.flex;
    this.optimized = true;
  }else{
    this.optimizeError = true;
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
  controller = this;
  $http({
    method: 'GET',
    // url: 'http://localhost:3000/players',
    url: 'https://optimizerapi.herokuapp.com/players',

  }).then(function(response){
    if($localStorage.players.length !== 0){
      controller.optimize();

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
      controller.optimize();
    }
  });
  $localStorage.teams.sort();

});
