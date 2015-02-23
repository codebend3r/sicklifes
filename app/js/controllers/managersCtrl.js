/**
 * Created by Bouse on 01/01/2015
 */

sicklifesFantasy.controller('managersCtrl', function ($scope, $rootScope, $timeout, $updateDataUtils, $fireBaseService, $routeParams, $dateService, $q, $managersService, localStorageService, $location) {

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
   */
  $scope.updateEverything = $updateDataUtils.updateEverything;

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
    console.log('$rootScope.managersData', $rootScope.managersData);
    console.log('////////////////////////////////////');

    var saveObject = {
      _lastSyncedOn: $dateService.syncDate(),
      chester: $rootScope.managersData[0],
      frank: $rootScope.managersData[1],
      dan: $rootScope.managersData[2],
      justin: $rootScope.managersData[3],
      mike: $rootScope.managersData[4],
      joe: $rootScope.managersData[5]
    };

    $fireBaseService.syncManagersData(saveObject);

  };

  $scope.populateTeamsInLeague = function () {

    $updateDataUtils.updateTeamsInLeague();

  };

  ////////////////////////////////////////
  ////////////// private /////////////////
  ////////////////////////////////////////

  /**
   * defines $scope.selectedManager
   */
  var chooseTeam = function () {

    if ($routeParams.manager) {
      _.each($rootScope.managersData, function (manager) {
        if (manager.managerName === $routeParams.manager) {
          $scope.selectedManager = manager;
        }
      });
    } else {
      $scope.selectedManager = $rootScope.managersData[0];
    }

  };

  /**
   * call from when $rootScope, localstorage, or firebase data is loaded
   * @param data - data passed from promise
   */
  var dataLoaded = function (data) {

    console.log('managersCtrl - dataLoaded', data);

    if (angular.isUndefined($rootScope.managersData)) {
      $rootScope.managersData = [
        data.managersData.chester,
        data.managersData.frank,
        data.managersData.dan,
        data.managersData.justin,
        data.managersData.mike,
        data.managersData.joe
      ];
    }

    if (angular.isUndefined($rootScope.playerPoolData)) {
      $rootScope.playerPoolData = data.playerPoolData;
    }

    if (angular.isUndefined($rootScope.allLeagueTeamsData)) {
      $rootScope.allLeagueTeamsData = data.allLeagueTeamsData;
    }

    //console.log('syncDate playerPoolData', data.playerPoolData._lastSyncedOn);
    //console.log('syncDate leagueData', data.leagueData._lastSyncedOn);
    //console.log('syncDate managersData', data.managersData._lastSyncedOn);
    //console.log('syncDate allTeamsData', data.allTeamsData._lastSyncedOn);

    console.log('$rootScope.managersData', $rootScope.managersData);
    console.log('$rootScope.playerPoolData', $rootScope.playerPoolData);
    console.log('$rootScope.allLeagueTeamsData', $rootScope.allLeagueTeamsData);

    $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

    chooseTeam();

    $scope.loading = false;

  };

  /**
   * retrieve data from $rootScope
   */
  var getFromRootScope = function () {

    var defer = $q.defer();
    console.log('managersCtrl - getFromRootScope');
    if (angular.isDefined($rootScope.managersData) && angular.isDefined($rootScope.playerPoolData) && angular.isDefined($rootScope.allLeagueTeamsData)) {
      defer.resolve({
        managersData: $rootScope.managersData,
        playerPoolData: $rootScope.playerPoolData,
        allLeagueTeamsData: $rootScope.allLeagueTeamsData
      });
    } else {
      defer.reject();
    }
    return defer.promise;

  };

  /**
   * retrieve data from local storage
   */
  var getFromLocalStorage = function () {

    var defer = $q.defer();
    console.log('managersCtrl - getFromLocalStorage');
    if (angular.isDefined(localStorageService.get('managersData')) && angular.isDefined(localStorageService.get('playerPoolData')) && angular.isDefined(localStorageService.get('allLeagueTeamsData'))) {
      defer.resolve({
        managersData: localStorageService.get('managersData'),
        playerPoolData: localStorageService.get('playerPoolData'),
        allLeagueTeamsData: localStorageService.get('allLeagueTeamsData')
      });
    } else {
      defer.reject();
    }
    return defer.promise;

  };

  /**
   * retrieve data from firebase
   */
  var getFromFireBase = function () {

    var defer = $q.defer();
    console.log('managersCtrl - getFromFireBase');

    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.then(function (result) {
      defer.resolve(result);
    }, function () {
      defer.reject();
    });

    return defer.promise;

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

    var dataLoad = false;

    getFromRootScope()
      .then(function (result) {
        console.log('1. $rootScope success');
        dataLoaded(result);
        dataLoad = true;
      }, function () {
        console.log('1. $rootScope fail - get from localstorage');
        return getFromLocalStorage();
      })
      .then(function (result) {
        if (!dataLoad) {
          console.log('2. localstorage success');
          dataLoaded(result);
          dataLoad = true;
        }
      }, function () {
        console.log('2. localstorage fail - get from firebase');
        return getFromFireBase();
      })
      .then(function (result) {
        if (!dataLoad) {
          //console.log('result', result);
          console.log('3. if no localstorage - firebase loaded');
          dataLoaded(result.data);
          dataLoad = true;
        }
      })

  };

  init();

});


