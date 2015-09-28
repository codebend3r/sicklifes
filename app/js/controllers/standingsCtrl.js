/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('standingsCtrl', function ($scope, $rootScope, $timeout, $apiFactory, $stateParams, $fireBaseService, $updateDataUtils, $localStorage) {

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
          hoverTitle: 'Team',
          text: 'Team'
        },
        {
          hoverTitle: 'Domestic Goals',
          text: 'DG'
        },
        {
          hoverTitle: 'Champions League Goals',
          text: 'CLG'
        },
        {
          hoverTitle: 'Europa League Goals',
          text: 'EG'
        },
        {
          hoverTitle: 'Total Points',
          text: 'PTS'
        }
      ];

      /**
       * consolidated list of all owned players by a manager
       */
      $scope.allLeagues = null;

      $scope.updateAllManagerData = null;

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * callback for when firebase is loaded
       * @param firebaseData {object} - firebase data object
       */
      var loadData = function (result) {

        console.log('///////////////////');
        console.log('result:', result);
        console.log('///////////////////');

        $rootScope.fireBaseReady = true;

        $scope.managersData = $scope.populateManagersData(result.data);
        console.log('syncDate:', result._lastSyncedOn);

        if ($scope.checkYesterday(result._lastSyncedOn)) {

          console.log('-- data is too old --');

          $rootScope.loading = false;

          $scope.startFireBase(function () {

            $rootScope.fireBaseReady = true;

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(result.data);

            // define selectedManager by managerId
            $scope.selectedManager = $scope.managerData[$stateParams.managerId];

            $updateDataUtils.updateAllManagerData(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          $rootScope.loading = false;
          $scope.managerData = $scope.populateManagersData(result.data);

        }

      };

      /**
       *
       * @param managerData
       */
      var onManagersRequestFinished = function (managerData) {

        console.log('onManagersRequestFinished');
        $rootScope.loading = false;
        $scope.saveRoster();

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

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

      };

      init();

    });

})();
