/**
 * Created by Bouse on 01/01/2015
 */

angular.module('sicklifes')

  .controller('managersCtrl', function ($scope, $rootScope, $timeout, $updateDataUtils, $fireBaseService, $localStorage, $routeParams, $dateService, $q, $managersService, $location) {

    ////////////////////////////////////////
    /////////////// public /////////////////
    ////////////////////////////////////////

    var dataKeyName = 'managersData';

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

      $fireBaseService.saveToFireBase(saveObject, dataKeyName);

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

    var httpDataLoaded = function (result) {

      console.log('///////////////////');
      console.log('HTTP -- > result', result);
      console.log('///////////////////');

      $scope.loading = false;

    };

    var loadFromLocal = function (data) {

      console.log('///////////////////');
      console.log('LOCAL -- > data', data);
      console.log('///////////////////');

      $scope.loading = false;

    };

    var fireBaseLoaded = function (data) {

      console.log('///////////////////');
      console.log('FB --> data.managersData:', data[dataKeyName]);
      console.log('///////////////////');

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

      $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

      chooseTeam();

      $scope.loading = false;

    };

    var init = function () {

      console.log('managersCtrl - init');

      if (angular.isDefined($rootScope[dataKeyName])) {

        loadFromLocal($rootScope[dataKeyName]);

      } else if (angular.isDefined($localStorage[dataKeyName])) {

        loadFromLocal($localStorage[dataKeyName]);

      } else {

        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(fireBaseLoaded);
      }

    };

    $timeout(init, 0);

  });
