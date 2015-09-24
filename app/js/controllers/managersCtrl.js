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

      $scope.dataKeyName = 'managersData';

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

        /*_.each($scope.managerData, function (m) {

          _.each(m.players, function (p) {

            if (p.leagueName === 'SERIE A') {
              p.leagueName = 'SERI';
            }

            if (p.leagueName === 'LA LIGA') {
              p.leagueName = 'LIGA';
            }

            //console.log(m.managerName, '|',p.playerName, '|', p.leagueName);

          });

        });*/

        var saveObject = {
          _lastSyncedOn: $momentService.syncDate(),
          chester: $scope.managerData.chester,
          frank: $scope.managerData.frank,
          dan: $scope.managerData.dan,
          justin: $scope.managerData.justin,
          mike: $scope.managerData.mike,
          joe: $scope.managerData.joe
        };

        $scope.saveToFireBase(saveObject, $scope.dataKeyName);

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

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

        if ($scope.checkYesterday(localData._lastSyncedOn)) {

          console.log('-- data is too old --');

          $scope.startFireBase(function (firebaseData) {

            $rootScope.fireBaseReady = true;

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(localData);

            // define the current manager
            $scope.chooseManager($stateParams.managerId);

            $scope.selectedManager = $scope.managerData[$stateParams.managerId];

            $updateDataUtils.updateAllManagerData(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          $scope.startFireBase(function () {

            $rootScope.fireBaseReady = true;
            $rootScope.loading = false;
            $scope.managerData = $scope.populateManagersData(localData);
            $scope.chooseManager($stateParams.managerId);

          });

        }

      };

      /**
       * callback for when firebase is loaded
       * @param firebaseData {object} - firebase data object
       */
      var firebaseLoaded = function (firebaseData) {

        console.log('///////////////////');
        console.log('FB --> firebaseData.managersData:', firebaseData[$scope.dataKeyName]);
        console.log('///////////////////');

        $rootScope.fireBaseReady = true;

        $scope.managersData = $scope.populateManagersData(firebaseData.managersData);
        console.log('syncDate:', firebaseData[$scope.dataKeyName]._lastSyncedOn);

        if ($scope.checkYesterday(firebaseData[$scope.dataKeyName]._lastSyncedOn)) {

          console.log('-- data is too old --');
          $rootScope.loading = false;

          $scope.startFireBase(function () {

            $rootScope.fireBaseReady = true;

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(firebaseData.managersData);

            // define the current manager
            $scope.chooseManager($stateParams.managerId);

            $scope.selectedManager = $scope.managerData[$stateParams.managerId];

            $updateDataUtils.updateAllManagerData(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          $rootScope.loading = false;
          $scope.managerData = $scope.populateManagersData(firebaseData.managersData);
          $scope.chooseManager($stateParams.managerId);

        }

      };

      /**
       *
       * @param managerData
       */
      var onManagersRequestFinished = function (managerData) {
        console.log('onManagersRequestFinished');
        $rootScope.loading = false;
        $scope.managerData = $scope.populateManagersData(managerData);
        $scope.chooseManager($stateParams.managerId);
        $scope.saveRoster();
      };

      var init = function () {

        console.log('managersCtrl - init');

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(firebaseLoaded);

        }

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

      };

      init();

    });

})();
