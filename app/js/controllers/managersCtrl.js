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

      console.log('-- managersCtrl --');

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

        //$scope.selectedManager = selectedManager;
        $state.go($state.current.name, { managerId: selectedManager.managerName.toLowerCase() });

      };

      /**
       * tabs data
       */
      $scope.tabData = [
        {
          heading: 'Overview',
          route: 'managers.overview'
        },
        {
          heading: 'Game Logs',
          route: 'managers.gamelogs'
        }
      ];

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * callback for when firebase is loaded
       * @param result {object} - response
       */
      var loadData = function (result) {

        console.log('///////////////////');
        console.log('result:', result);
        console.log('///////////////////');

        $rootScope.fireBaseReady = true;

        console.log('syncDate:', result._lastSyncedOn);

        if ($scope.checkYesterday(result._lastSyncedOn)) {

          console.log('-- data is too old --');

          $rootScope.loading = false;

          $scope.startFireBase(function () {

            // tell firebase it is ready to be updated
            $rootScope.fireBaseReady = true;

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(result.data);

            // define the current manager
            $scope.chooseManager($stateParams.managerId);

            // define selectedManager by managerId
            $scope.selectedManager = $scope.managerData[$stateParams.managerId];

            $updateDataUtils.updateAllManagerData(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          // tell firebase it is ready to be updated
          $rootScope.loading = false;

          // define managerData on scope and $rootScope
          $scope.managerData = $scope.populateManagersData(result.data);

          // define the current manager
          $scope.chooseManager($stateParams.managerId);

          // define selectedManager by managerId
          $scope.selectedManager = $scope.managerData[$stateParams.managerId];

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

      $scope.updateAllManagerData = function() {
        $rootScope.loading = true;
        $updateDataUtils.updateAllManagerData(onManagersRequestFinished);
      };

      var init = function () {

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadData($localStorage[$scope.dataKeyName]);

        } else {


          $scope.startFireBase(function (firebaseData) {

            console.log('load from firebase');
            loadData(firebaseData[$scope.dataKeyName]);

          });

        }

      };

      init();

    });

})();
