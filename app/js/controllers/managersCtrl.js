/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $state, $updateDataUtils, $fireBaseService, $moment, $momentService, $localStorage, $stateParams) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.loading = true;

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
       *
       */
      $scope.byPickNumber = function (player) {
        return player.pickNumber;
      };

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
        $state.go($state.current.name, { managerId: selectedManager.managerName.toLowerCase() });

      };

      /**
       * saves current data to firebase
       */
      $scope.saveRoster = function () {

        var saveObject = {
          _lastSyncedOn: $momentService.syncDate(),
          chester: $scope.managersData.chester,
          frank: $scope.managersData.frank,
          dan: $scope.managersData.dan,
          justin: $scope.managersData.justin,
          mike: $scope.managersData.mike,
          joe: $scope.managersData.joe
        };

        $scope.saveToFireBase(saveObject, dataKeyName);

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       *
       * @type {string}
       */
      var dataKeyName = 'managersData';

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

        $scope.chooseManager($stateParams.managerId);

      };

      /**
       * callback for when local storage exists
       * @param localData {object}
       */
      var loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('///////////////////');

        console.log('syncDate:', localData._lastSyncedOn);

        $rootScope.loading = false;

        if ($scope.checkYesterday(localData._lastSyncedOn)) {

          console.log('-- data is too old --');

          $scope.startFireBase(function (firebaseData) {

            $rootScope.fireBaseReady = true;

            $updateDataUtils.updateAllManagerData()
              .then(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          $scope.startFireBase(function (firebaseData) {

            $rootScope.fireBaseReady = true;
            $scope.managerData = $scope.populateManagersData(firebaseData.managersData);
            $scope.chooseManager($stateParams.managerId);

            $scope.saveRoster();

          });

        }

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

        $rootScope.loading = false;

        $scope.managersData = $scope.populateManagersData(firebaseData.managersData);
        console.log('syncDate:', firebaseData[dataKeyName]._lastSyncedOn);

        if ($scope.checkYesterday(firebaseData[dataKeyName]._lastSyncedOn)) {

          console.log('-- data is too old --');
          $updateDataUtils.updateAllManagerData()
            .then(onManagersRequestFinished);

        } else {

          console.log('-- data is up to date --');

          $scope.managerData = $scope.populateManagersData(firebaseData.managersData);
          $scope.chooseManager($stateParams.managerId);
          //$scope.saveRoster();

        }


      };

      /**
       *
       * @param managerData
       */
      var onManagersRequestFinished = function (managerData) {
        console.log('-- http request finished --');
        //$scope.managerData = managerData;
        $scope.managerData = $scope.populateManagersData(managerData);
        $scope.chooseManager($stateParams.managerId);
        $scope.saveRoster();
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

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

      };

      init();

    });

})();
