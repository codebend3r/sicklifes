/**
 * Created by Bouse on 11/03/2014
 */

sicklifesFantasy.controller('monthlyWinnersCtrl', function ($scope, $apiFactory, $leagueTeams, $routeParams, $fireBaseService, $date, localStorageService, $arrayMappers) {

  $scope.loading = true;

  $scope.admin = $routeParams.admin;

  $scope.allMonths = [
    {
      monthName: 'All Months',
      range: ['August 1 2014', 'March 31 2015']
    },
    {
      monthName: 'August 2014',
      range: ['August 1 2014', 'August 31 2014']
    },
    {
      monthName: 'September 2014',
      range: ['September 1 2014', 'September 30 2014']
    },
    {
      monthName: 'October 2014',
      range: ['October 1 2014', 'October 31 2014']
    },
    {
      monthName: 'November 2014',
      range: ['November 1 2014', 'November 30 2014']
    },
    {
      monthName: 'December 2014',
      range: ['December 1 2014', 'December 31 2014']
    },
    {
      monthName: 'January 2015',
      range: ['January 1 2015', 'January 31 2015']
    },
    {
      monthName: 'February 2015',
      range: ['February 1 2015', 'February 28 2015']
    }
  ];

  $scope.selectedMonth = $scope.allMonths[0];

  $scope.changeMonth = function (month) {
    $scope.selectedMonth = month;
    updateFilter();
  };

  $scope.tableHeader = [
    {
      columnClass: 'col-md-4 col-sm-4 col-xs-5',
      text: 'Player'
    },
    {
      columnClass: 'col-md-3 hidden-sm hidden-xs',
      text: 'Opponent'
    },
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-3',
      text: 'Goals'
    },
    {
      columnClass: 'col-md-2 col-sm-3 hidden-xs',
      text: 'League'
    },
    {
      columnClass: 'col-md-2 col-sm-3 col-xs-4',
      text: 'Date'
    }
  ];

  var isSelectedMonth = function (game) {
    var gameDate = game.rawDatePlayed || $date.create(game.box_score.event.game_date),
      scoredAGoal = game.goals ? true : false,
      isBetween = gameDate.isBetween($scope.selectedMonth.range[0], $scope.selectedMonth.range[1]);
    return isBetween && scoredAGoal;
  };

  var allManagers = [];

  $scope.populateTable = function () {

    console.log('////////////////////////////////////');
    console.log('allManagers', allManagers);
    console.log('////////////////////////////////////');

    allManagers.forEach(function (manager) {

      manager.players.forEach(function (player) {

        var ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id),
          eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id),
          seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id),
          chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id),
          euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

        manager.totalPoints = 0;
        manager.totalGoals = 0;
        manager.monthlyGoalsLog = [];
        manager.filteredMonthlyGoalsLog = [];

        ligaGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter(filterGoalsOnly).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
          manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
          manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
        });

        eplGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter(filterGoalsOnly).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
          manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
          manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
        });

        seriGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter(filterGoalsOnly).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
          manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
          manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
        });

        chlgGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter(filterGoalsOnly).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
          manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
          manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
        });

        euroGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter(filterGoalsOnly).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
          manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
          manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
        });

      });

    });

  };

  $scope.saveToFireBase = function () {

    allManagers = angular.copy(allManagers);

    console.log('////////////////////////////////////');
    console.log('allManagers', allManagers);
    console.log('////////////////////////////////////');

    $scope.allManagers = allManagers;

    var saveObject = {
      _lastSynedOn: $dateService.syncDate(),
      //__allPlayers: $scope.allPlayers,
      //__allLeagues: $scope.allLeagues,
      //__allTeams: $scope.allTeams,
      chester: allManagers[0],
      frank: allManagers[1],
      dan: allManagers[2],
      justin: allManagers[3],
      mike: allManagers[4],
      joe: allManagers[5]
    };

    $fireBaseService.syncLeagueTeamData(saveObject);

  };
  
  /////////////////////////////////////////////////////////////
  
  var filterOnMonth = function (manager, player, game) {
    var gameDate = $date.create(game.originalDate),
      scoredAGoal = game.goalsScored ? true : false,
      isBetween = gameDate.isBetween($scope.selectedMonth.range[0], $scope.selectedMonth.range[1]);
    
    if (isBetween && scoredAGoal ) {
      
      manager.totalGoals += game.goalsScored;
      manager.totalPoints += game.points;
      return true;
      
    }
  };
  
  var filterGoalsOnly = function (game) {
    var scoredAGoal = game.goals ? true : false;    
    return scoredAGoal;
  };
  
  var allManagers = [];
  
  var updateFilter = function() {
  
    allManagers.forEach(function (manager) {

      manager.players.forEach(function (player) {
        
        manager.totalPoints = 0;
        manager.totalGoals = 0;
        
        manager.filteredMonthlyGoalsLog = manager.monthlyGoalsLog.filter(filterOnMonth.bind($scope, manager, player));

      });

    })

  };

  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded');

    allManagers = [
      data.leagueTeamData.chester,
      data.leagueTeamData.frank,
      data.leagueTeamData.dan,
      data.leagueTeamData.justin,
      data.leagueTeamData.mike,
      data.leagueTeamData.joe
    ];

    $scope.allManagers = allManagers;

    $scope.loading = false;

  };

  /*
   * TODO
   */
  var init = function () {

    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();

    firePromise.promise.then(fireBaseLoaded, function () {

      console.log('firebase unavailable');
      $scope.loading = false;
      var localManagers = localStorageService.get('leagueTeamData');
      console.log('localManagers', localManagers);

    });


  };

  init();

});
