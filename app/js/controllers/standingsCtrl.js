/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('standingsCtrl', function ($scope, $timeout, $apiFactory, $stateParams, $fireBaseService, $updateDataUtils, $objectUtils, $momentService, $managersService, $location) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /**
       * whether data is still loading
       */
      $scope.loading = true;

      /**
       * url param - whether admin is true
       */
      $scope.admin = $stateParams.admin;

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
       * TODO
       */
      var allRequestComplete = function () {

        console.log('allRequestComplete');

        $scope.loading = false;

      };

      $scope.saveToFireBase = function () {

        console.log('////////////////////////////////////');
        console.log('$scope.managersData', $scope.managersData);
        console.log('////////////////////////////////////');

        var saveObject = {
          _syncedFrom: 'standingsCtrl',
          _lastSyncedOn: $dateService.syncDate(),
          chester: $scope.managersData[0],
          frank: $scope.managersData[1],
          dan: $scope.managersData[2],
          justin: $scope.managersData[3],
          mike: $scope.managersData[4],
          joe: $scope.managersData[5]
        };

        $fireBaseService.syncManagersData(saveObject);

      };

      /**
       * call when firebase data has loaded
       * defines $scope.managersData
       * @param data
       */
      var fireBaseLoaded = function (data) {

        console.log('fireBaseLoaded -- standingsCtrl', data);

        $scope.managersData = [
          data.managersData.chester,
          data.managersData.frank,
          data.managersData.dan,
          data.managersData.justin,
          data.managersData.mike,
          data.managersData.joe
        ];

        //console.log('syncDate allPlayersData', data.allPlayersData._lastSyncedOn);
        //console.log('syncDate leagueData', data.leagueData._lastSyncedOn);
        //console.log('syncDate managersData', data.managersData._lastSyncedOn);

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.managersData);

        $scope.loading = false;

      };

      /**
       * init function
       */
      var init = function () {

        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(fireBaseLoaded);

      };

      init();

    });

})();
