/**
 * Created by Bouse on 01/01/2015
 */

sicklifesFantasy.controller('managersCtrl', function ($scope, $rootScope, $timeout, $updateDataUtils, $fireBaseService, $routeParams, $dateService, $managersService, $location) {

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
   * all managers data
   */
  $scope.updateAllManagerData = null;

  /**
   *
   * @param selectedManager
   */
  $scope.changeManager = function (selectedManager) {

    $scope.selectedManager = selectedManager;
    $location.url($location.path() + '?manager=' + selectedManager.managerName); // route change

  };

  /**
   * saves current data to firebase
   */
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

  $scope.populateTeamsInLeague = function() {

    $updateDataUtils.updateTeamsInLeague();

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

  };

  var allTeamsInLeagues = null;

  /**
   * call when firebase data has loaded
   * defines $scope.allManagers
   * @param data
   */
  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded');

    $scope.allManagers = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    $rootScope.allLeagueTeams = data.allTeamsData;

    console.log('syncDate allPlayersData', data.allPlayersData._lastSyncedOn);
    console.log('syncDate leagueData', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData', data.managersData._lastSyncedOn);
    console.log('syncDate allTeamsData', data.allTeamsData);

    $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.allManagers);

    chooseTeam();

    console.log('$scope.allManagers', $scope.allManagers);

    $scope.loading = false;

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

  };

  /**
   * init function
   */
  var init = function () {

    console.log('managersCtrl - init');
    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded, getFromLocalStorage);

  };

  $timeout(init, 250);

});


