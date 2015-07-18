(function () {

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $timeout, $updateDataUtils, $fireBaseService, $moment, $momentService, $localStorage, $routeParams, $q, $managersService, $location) {

      var dataKeyName = 'managersData';

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
          _lastSyncedOn: $momentService.syncDate(),
          chester: $rootScope.managersData[0],
          frank: $rootScope.managersData[1],
          dan: $rootScope.managersData[2],
          justin: $rootScope.managersData[3],
          mike: $rootScope.managersData[4],
          joe: $rootScope.managersData[5]
        };

        $fireBaseService.saveToFireBase(saveObject, dataKeyName);

      };

      /**
       *
       */
      $scope.populateTeamsInLeague = function () {

        //$updateDataUtils.updateTeamsInLeague();

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
       * get data through HTTP request
       */
      var getHttpData = function () {

        console.log('GET FROM HTTP');

        $updateDataUtils.updateLeagueTables()
          .then(httpDataLoaded);

      };

      /**
       * is it past yesterday
       * @param syncDate {string}
       */
      var checkYesterday = function (syncDate) {

        console.log('syncDate:', syncDate);

        if ($momentService.isPastYesterday(syncDate)) {
          console.log('IS YESTERDAY');
          getHttpData();
          return true;
        } else {
          console.log('NOT YESTERDAY YET');
          $scope.loading = false;
          return false;
        }

      };

      /**
       * callback for when http data is loaded
       * @param result {object}
       */
      var httpDataLoaded = function (result) {

        console.log('///////////////////');
        console.log('HTTP --> result', result);
        console.log('///////////////////');

        $scope.loading = false;

        chooseTeam();

      };

      /**
       * populates $rootScope.managersData
       * @param data
       */
      var populateManagersData = function (data) {

        $scope.managersData = [
          data.chester,
          data.frank,
          data.dan,
          data.justin,
          data.mike,
          data.joe
        ];

        $rootScope.managersData = $scope.managersData;

      };

      /**
       * callback for when local storage exists
       */
      var loadFromLocal = function () {

        $rootScope.managersData = $localStorage.managersData;

        console.log('///////////////////');
        console.log('$localStorage.managersData', $localStorage.managersData);
        console.log('$rootScope.managersData', $rootScope.managersData);
        console.log('///////////////////');

        checkYesterday($rootScope.managersData._lastSyncedOn);

        chooseTeam();

      };

      /**
       * callback for when firebase is loaded
       * @param firebaseData {object} - firebase data object
       */
      var fireBaseLoaded = function (firebaseData) {

        console.log('///////////////////');
        console.log('FB --> firebaseData.managersData:', firebaseData[dataKeyName]);
        console.log('///////////////////');

        populateManagersData(firebaseData.managersData);

        if (angular.isUndefinedOrNull($rootScope.playerPoolData)) {
          $rootScope.playerPoolData = firebaseData.playerPoolData;
        }

        if (angular.isUndefinedOrNull($rootScope.allLeagueTeamsData)) {
          $rootScope.allLeagueTeamsData = firebaseData.allLeagueTeamsData;
        }

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

        console.log('syncDate:', firebaseData[dataKeyName]._lastSyncedOn);

        checkYesterday(firebaseData[dataKeyName]._lastSyncedOn);

        chooseTeam();

      };

      var init = function () {

        console.log('managersCtrl - init');

        if (angular.isDefined($rootScope[dataKeyName])) {

          loadFromLocal();

        } else if (angular.isDefined($localStorage[dataKeyName])) {

          populateManagersData($localStorage[dataKeyName]);
          loadFromLocal();

        } else {

          $fireBaseService.initialize($scope);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.then(fireBaseLoaded);
        }

      };

      $timeout(init, 0);

    });

})();