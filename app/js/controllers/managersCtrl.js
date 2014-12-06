/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('managersCtrl', function ($scope, localStorageService, $apiFactory, $fireBaseService, $routeParams, $objectUtils, $arrayMappers, $arrayLoopers, $arrayFilter, $textManipulator, $dateService, $managersService, $location) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  /**
   * TODO
   */
  $scope.loading = true;

  /**
   * TODO
   */
  $scope.admin = $routeParams.admin;

  /**
   * TODO
   */
  $scope.tableHeader = [
    {
      columnClass: 'col-md-3 col-sm-3 col-xs-4',
      text: 'Player',
      hoverText: 'Player',
      orderCriteria: 'playerName'
    },
    {
      columnClass: 'col-md-2 col-sm-3 col-xs-4',
      text: 'Team',
      hoverText: 'Team',
      orderCriteria: 'teamName'
    },
    {
      columnClass: 'col-md-2 col-sm-2 hidden-xs',
      text: 'League',
      hoverText: 'League',
      orderCriteria: 'leagueName'
    },
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center',
      text: 'TG',
      hoverText: 'Total Goals',
      orderCriteria: 'goals'
    },
    {
      columnClass: 'col-md-1 hidden-sm hidden-xs text-center',
      text: 'DG',
      hoverText: 'Domestic Goals',
      orderCriteria: 'domesticGoals'
    },
    {
      columnClass: 'col-md-1 hidden-sm hidden-xs text-center',
      text: 'CLG',
      hoverText: 'Champions League Goals',
      orderCriteria: 'clGoals'
    },
    {
      columnClass: 'col-md-1 hidden-sm hidden-xs text-center',
      text: 'ELG',
      hoverText: 'Europa League Goals',
      orderCriteria: 'eGoals'
    },
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center',
      text: 'TP',
      hoverText: 'Total Points',
      orderCriteria: 'points()'
    }
  ];

  /**
   * TODO
   */
  $scope.changeManager = function (selectedManager) {

    $scope.selectedManager = selectedManager;
    $location.url($location.path() + '?manager=' + selectedManager.managerName); // route change

  };

  /**
   * called from ng-click, makes a request from TheScore to get new data
   */
  $scope.updateData = function () {

    console.log('UPDATING...');

    var allLeaguePromises = [];

    $scope.allManagers.forEach(function (manager) {

      // reset goal counts
      manager = $objectUtils.cleanManager(manager, true);

      manager.seriCount = 0;
      manager.ligaCount = 0;
      manager.eplCount = 0;
      manager.wildCardCount = 0;

      manager.players.forEach(function (player) {

        player = $objectUtils.playerResetGoalPoints(player)

        var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', player.id);

        playerProfileRequest.promise.then(function (result) {

          player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

          // based on player result data return an object with the valid leagues for this player
          var validLeagues = $textManipulator.getPlayerValidLeagues(result),
            ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id),
            eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id),
            seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id),
            chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id),
            euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

          if (validLeagues.inLiga) {
            if (player.status !== 'dropped') manager.ligaCount += 1;
            ligaGamesRequest.promise.then(function (result) {
              var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind($scope, player)).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
            });
            allLeaguePromises.push(ligaGamesRequest.promise);
          }

          if (validLeagues.inEPL) {
            if (player.status !== 'dropped') manager.eplCount += 1;
            eplGamesRequest.promise.then(function (result) {
              var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind($scope, player)).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
            });
            allLeaguePromises.push(eplGamesRequest.promise);
          }

          if (validLeagues.inSeri) {
            if (player.status !== 'dropped') manager.seriCount += 1;
            seriGamesRequest.promise.then(function (result) {
              var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind($scope, player)).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
            });
            allLeaguePromises.push(seriGamesRequest.promise);
          }

          if (validLeagues.inChlg) {
            chlgGamesRequest.promise.then(function (result) {
              var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind($scope, player)).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
            });
            allLeaguePromises.push(chlgGamesRequest.promise);
          }

          if (validLeagues.inEuro) {
            euroGamesRequest.promise.then(function (result) {
              var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind($scope, player)).map($arrayMappers.monthlyMapper.bind($scope, manager, player));
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
            });
            allLeaguePromises.push(euroGamesRequest.promise);
          }

          // logical definition for a wildcard player
          if ((validLeagues.inChlg || validLeagues.inEuro) && !validLeagues.inLiga && !validLeagues.inEPL && !validLeagues.inSeri) {
            if (player.status !== 'dropped') manager.wildCardCount += 1;
          }

        });

      });

      $apiFactory.listOfPromises(allLeaguePromises, function () {

        console.log('DONE...');

      });

    });

  };

  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'managersCtrl',
      _lastSyncedOn: $dateService.syncDate(),
      chester: $scope.allManagers[0],
      frank: $scope.allManagers[1],
      dan: $scope.allManagers[2],
      justin: $scope.allManagers[3],
      mike: $scope.allManagers[4],
      joe: $scope.allManagers[5]
    };

    $fireBaseService.syncLeagueTeamData(saveObject);

  };

  ////////////////////////////////////////
  ////////////// private /////////////////
  ////////////////////////////////////////

  /**
   * defines $scope.selectedTeam
   */
  var chooseTeam = function () {

    if ($routeParams.manager) {
      $scope.allManagers.forEach(function (manager) {
        if (manager.managerName === $routeParams.manager) {
          $scope.selectedManager = manager;
        }
      });
    } else {
      $scope.selectedManager = $scope.allManagers[0];
    }

    //console.log('$scope.selectedManager', $scope.selectedManager);
    //$location.url($location.path() + '?team=' + $scope.selectedTeam.managerName); // route change

  };

  /**
   * modifies array that table is binded to
   */
  var populateTable = function () {

    var masterDefferedList = [];

    $scope.allManagers.forEach(function (manager) {

      manager.deferredList = [];

      // loops through all players and makes request for all goals
      manager.players.forEach($arrayLoopers.forEachPlayer.bind($scope, $scope, manager));

      masterDefferedList = masterDefferedList.concat(manager.deferredList);

      manager.deferredList = null;

    });

    console.log('masterDefferedList.length', masterDefferedList.length);

    $apiFactory.listOfPromises(masterDefferedList, function () {
      console.log('ALL DONE');
    });

  };

  /**
   * contains a reference to each league by key
   */
  var allLeaguesObj = {};

  /**
   * call when firebase data has loaded
   * defines $scope.allManagers
   * @param data
   */
  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded');

    $scope.loading = false;

    $scope.allManagers = [
      data.leagueTeamData.chester,
      data.leagueTeamData.frank,
      data.leagueTeamData.dan,
      data.leagueTeamData.justin,
      data.leagueTeamData.mike,
      data.leagueTeamData.joe
    ];

    chooseTeam();

    console.log('$scope.allManagers', $scope.allManagers);

  };

  /**
   * retrieve data from local storage
   */
  var getFromLocalStorage = function () {

    console.log('getFromLocalStorage');
    $scope.loading = false;
    var localManagers = localStorageService.get('leagueTeamData');
    console.log('localManagers', localManagers);

  };


  /**
   * all requests complete
   */
  var allRequestComplete = function () {

    console.log('allRequestComplete');
    $scope.loading = false;
    chooseTeam();
    populateTable();

  };

  /**
   * init function
   */
  var init = function () {

    $fireBaseService.initialize();
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded, getFromLocalStorage);

  };

  init();

});


