/**
 * Created by Bouse on 11/03/2014
 */

sicklifesFantasy.controller('monthlyWinnersCtrl', function ($scope, $apiFactory, $managersService, $routeParams, $textManipulator, $objectUtils, $fireBaseService, $arrayFilter, localStorageService, $dateService, $arrayMappers) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  $scope.loading = true;

  $scope.admin = $routeParams.admin;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-3 col-sm-4 col-xs-4',
      text: 'Player'
    },
    {
      columnClass: 'col-md-2 hidden-sm hidden-xs',
      text: 'Opponent'
    },
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center',
      text: 'Goals'
    },
    {
      columnClass: 'col-md-2 col-sm-2 col-xs-3 text-center',
      text: 'Score'
    },
    {
      columnClass: 'col-md-2 col-sm-2 hidden-xs',
      text: 'League'
    },
    {
      columnClass: 'col-md-2 col-sm-2 col-xs-3',
      text: 'Date'
    }
  ];

  /**
   * all months dropdown options
   * @type {{monthName: string, range: string[]}[]}
   */
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
    },
    {
      monthName: 'March 2015',
      range: ['March 1 2015', 'March 31 2015']
    },
    {
      monthName: 'April 2015',
      range: ['April 1 2015', 'April 30 2015']
    }
  ];

  $scope.selectedMonth = $scope.allMonths[0];

  $scope.allManagers = [];

  /**
   * {ng-click} - when manager option changes
   */
  $scope.changeManager = function (selectedManager) {

    $scope.manager = selectedManager;
    //$location.url($location.path() + '?team=' + selectedTeam.personName); // route change

  };

  /**
   * {ng-click} - when month option is changed
   */
  $scope.changeMonth = function (month) {
    $scope.selectedMonth = month;
    updateFilter();
  };

  /**
   * scrapes thescore.ca api and updates local array
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

  /**
   * saves data to firebase
   */
  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'monthlyWinnersCtrl',
      _lastSynedOn: $dateService.syncDate(),
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
   * filters game log by selected month
   */
  var updateFilter = function () {

    $scope.allManagers.forEach(function (manager) {

      manager.players.forEach(function (player) {

        manager = $objectUtils.cleanManager(manager, false);
        manager.filteredMonthlyGoalsLog = manager.monthlyGoalsLog.filter($arrayFilter.filterOnMonth.bind($scope, manager, $scope.selectedMonth, player));

      });

    })

  };

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

    $scope.manager = $scope.allManagers[0];

    updateFilter();

    //var syncDate = $date.create(data.leagueData._lastSynedOn);

    console.log('syncDate leagueData', data.leagueData._lastSynedOn);
    console.log('syncDate leagueTeamData', data.leagueTeamData._lastSynedOn);
    console.log('$scope.allManagers', $scope.allManagers);

  };

  /**
   * retrieve data from local storage
   */
  var getFromLocalStorage = function () {

    console.log('firebase unavailable');
    $scope.loading = false;
    var localManagers = localStorageService.get('leagueTeamData');
    console.log('localManagers', localManagers);

  };

  /**
   * init controller
   */
  var init = function () {

    $fireBaseService.initialize();
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded, getFromLocalStorage);

  };

  init();

});
