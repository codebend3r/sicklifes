(function () {

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $updateDataUtils, $fireBaseService, $moment, $momentService, $localStorage, $stateParams, $q, $managersService, $location) {

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
      $scope.admin = $location.search().admin;

      /**
       * TODO
       */
      $scope.tableHeader = [
        {
          text: 'Player',
          hoverText: 'Player',
          orderCriteria: 'playerName'
        },
        {
          text: 'Team',
          hoverText: 'Team',
          orderCriteria: 'teamName'
        },
        {
          text: 'League',
          hoverText: 'League',
          orderCriteria: 'leagueName'
        },
        {
          text: 'TG',
          hoverText: 'Total Goals',
          orderCriteria: 'goals'
        },
        {
          text: 'DG',
          hoverText: 'Domestic Goals',
          orderCriteria: 'domesticGoals'
        },
        {
          text: 'CLG',
          hoverText: 'Champions League Goals',
          orderCriteria: 'clGoals'
        },
        {
          text: 'ELG',
          hoverText: 'Europa League Goals',
          orderCriteria: 'eGoals'
        },
        {
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

        if ($stateParams.manager) {
          _.each($rootScope.managersData, function (manager) {
            if (manager.managerName === $stateParams.manager) {
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

        console.log('managersCtrl - getHttpData()');

        $updateDataUtils.updateLeagueTables()
          .then(httpDataLoaded);

      };

      /**
       * is it past yesterday
       * @param syncDate {string}
       */
      var checkYesterday = function (syncDate) {

        if ($momentService.isPastYesterday(syncDate)) {
          console.log('IS YESTERDAY');
          getHttpData();
          return true;
        } else {
          console.log('NOT YESTERDAY YET');
          $scope.loading = false;
          startFireBase(function () {
            $scope.fireBaseReady = true;
            $scope.saveToFireBase();
          });
          return false;
        }

      };

      /**
       * callback for when http data is loaded
       * @param result {object}
       */
      var httpDataLoaded = function (result) {

        console.log('///////////////////');
        console.log('$HTTP --> result', result);
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

        return  {
          data: $scope.managersData,
          _lastSyncedOn: $momentService.syncDate()
        };

      };

      /**
       * callback for when local storage exists
       */
      var loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('///////////////////');

        var managerData = populateManagersData(localData);

        //$rootScope.managersData = localData.managersData;

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

        checkYesterday(managerData._lastSyncedOn);

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

        var managerData = populateManagersData(firebaseData.managersData);

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

        console.log('syncDate:', managerData._lastSyncedOn);

        checkYesterday(managerData._lastSyncedOn);

        chooseTeam();

      };

      /**
       * starts the process of getting data from firebase
       * @param callback
       */
      var startFireBase = function (callback) {

        console.log('--  firebase started --');
        if ($scope.fireBaseReady) {
          console.log('firebase previously loaded');
          callback();
        } else {
          $fireBaseService.initialize($scope);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.then(callback);
        }

      };

      var init = function () {

        console.log('managersCtrl - init');

        if (angular.isDefined($rootScope[dataKeyName])) {

          console.log('load from $rootScope');
          loadFromLocal($rootScope[dataKeyName]);

        } else if (angular.isDefined($localStorage[dataKeyName])) {

          console.log('load from local storage');
          loadFromLocal($localStorage[dataKeyName]);

        } else {

          console.log('load from firebase');
          startFireBase(fireBaseLoaded);
        }

      };

      init();

    });

})();
