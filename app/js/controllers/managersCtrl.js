/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $updateDataUtils, $fireBaseService, $moment, $momentService, $localStorage, $stateParams) {

      var dataKeyName = 'managersData';

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

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
        //$location.url($location.path() + '?manager=' + selectedManager.managerName); // route change
        $state.go($state.current.name, { managerId: selectedManager.managerName });

      };

      /**
       * saves current data to firebase
       */
      $scope.saveRoster = function () {

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

        console.log('saveObject', saveObject);

        $scope.saveToFireBase(saveObject, dataKeyName);

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
       * @param data {object}
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

        return {
          data: $scope.managersData,
          _lastSyncedOn: $momentService.syncDate()
        };

      };

      /**
       * callback for when local storage exists
       * @param localData {object}
       */
      var loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('///////////////////');

        var managerData = populateManagersData(localData);
        console.log('syncDate:', managerData._lastSyncedOn);

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

        $scope.checkYesterday(managerData._lastSyncedOn);

        chooseTeam();

        $scope.loading = false;

        $scope.startFireBase(function () {

          $rootScope.fireBaseReady = true;

        });

      };

      /**
       * callback for when firebase is loaded
       * @param firebaseData {object} - firebase data object
       */
      var firebaseLoaded = function (firebaseData) {

        console.log('///////////////////');
        console.log('FB --> firebaseData.managersData:', firebaseData[dataKeyName]);
        console.log('///////////////////');

        $rootScope.fireBaseReady = true;

        var managerData = populateManagersData(firebaseData.managersData);
        console.log('syncDate:', managerData._lastSyncedOn);

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

        checkYesterday(managerData._lastSyncedOn);

        chooseTeam();

        $scope.loading = false;

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
          $scope.startFireBase(firebaseLoaded);
        }

      };

      init();

    });

})();
