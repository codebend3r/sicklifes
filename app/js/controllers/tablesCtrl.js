/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('tablesCtrl', function ($scope, $http, $rootScope, $stateParams, $updateDataUtils, $textManipulator, $momentService, $localStorage) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> tablesCtrl');

      /**
       * header for custom-table directive
       */
      $scope.leagueTableHeader = [
        {
          columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center small-hpadding',
          text: 'Rank'
        },
        {
          columnClass: 'col-md-6 col-sm-4 col-xs-6 small-hpadding',
          text: 'Team'
        },
        {
          columnClass: 'col-md-1 col-sm-4 hidden-xs text-center small-hpadding',
          text: 'Record'
        },
        {
          columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
          text: 'GP'
        },
        {
          columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
          text: 'F'
        },
        {
          columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
          text: 'A'
        },
        {
          columnClass: 'col-md-1 col-sm-2 col-xs-4 text-center small-hpadding',
          text: 'Points'
        }
      ];

      /**
       * makes http request from thescore.ca API
       * @param httpData
       */
      var httpDataLoaded = function (httpData) {

        console.log('///////////////////');
        console.log('$HTTP --> httpData:', httpData);
        console.log('///////////////////');

        $scope.allLeagues[0].source = httpData[0].data;
        $scope.allLeagues[1].source = httpData[1].data;
        $scope.allLeagues[2].source = httpData[2].data;
        $scope.allLeagues[3].source = httpData[3].data;
        $scope.allLeagues[4].source = httpData[4].data;

        $scope.setSelectedLeague();

        $rootScope.loading = false;

        // after http request start firebase so we can save later
        $scope.startFireBase(function () {

          $rootScope.fireBaseReady = true;

          saveObject = {
            _syncedFrom: 'leagusCtrl',
            _lastSyncedOn: $momentService.syncDate(),
            LIGA: $scope.allLeagues[0].source,
            EPL: $scope.allLeagues[1].source,
            SERI: $scope.allLeagues[2].source,
            CHLG: $scope.allLeagues[3].source,
            UEFA: $scope.allLeagues[4].source
          };

          $scope.saveToFireBase(saveObject, 'leagueTables');

        });

      };

      /**
       * callback for when firebase data is loaded
       * @param firebaseData
       */
      var fireBaseLoaded = function (firebaseData) {

        console.log('///////////////////');
        console.log('FB --> firebaseData:', firebaseData[$scope.dataKeyName]);
        console.log('syncDate:', firebaseData[$scope.dataKeyName]._lastSyncedOn);
        console.log('///////////////////');

        $rootScope.fireBaseReady = true;

        $scope.allLeagues[0].source = firebaseData.leagueTables.LIGA;
        $scope.allLeagues[1].source = firebaseData.leagueTables.EPL;
        $scope.allLeagues[2].source = firebaseData.leagueTables.SERI;
        $scope.allLeagues[3].source = firebaseData.leagueTables.CHLG;
        $scope.allLeagues[4].source = firebaseData.leagueTables.UEFA;

        $scope.setSelectedLeague();

        saveObject = {
          _syncedFrom: 'leagusCtrl',
          _lastSyncedOn: $momentService.syncDate(),
          liga: $scope.allLeagues[0].source,
          epl: $scope.allLeagues[1].source,
          seri: $scope.allLeagues[2].source,
          chlg: $scope.allLeagues[3].source,
          uefa: $scope.allLeagues[4].source
        };

        if ($scope.checkYesterday(firebaseData[$scope.dataKeyName]._lastSyncedOn, saveObject)) {
          console.log('-- data is too old --');
          $scope.updateTablesFromHTTP(httpDataLoaded);
        } else {
          console.log('-- data is up to date --');
          $scope.saveToFireBase(saveObject, $scope.dataKeyName);
          $rootScope.loading = false;
        }

      };

      /**
       * read data from local storage
       * @param localData
       */
      var loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('syncDate:', localData._lastSyncedOn);
        console.log('///////////////////');

        $scope.allLeagues[0].source = localData.LIGA;
        $scope.allLeagues[1].source = localData.EPL;
        $scope.allLeagues[2].source = localData.SERI;
        $scope.allLeagues[3].source = localData.CHLG;
        $scope.allLeagues[4].source = localData.UEFA;

        $scope.setSelectedLeague();

        saveObject = {
          _syncedFrom: 'leagusCtrl',
          _lastSyncedOn: $momentService.syncDate(),
          liga: $scope.allLeagues[0].source,
          epl: $scope.allLeagues[1].source,
          seri: $scope.allLeagues[2].source,
          chlg: $scope.allLeagues[3].source,
          uefa: $scope.allLeagues[4].source
        };

        if ($scope.checkYesterday(localData._lastSyncedOn, saveObject)) {
          console.log('-- data is too old --');
          $scope.updateTablesFromHTTP(httpDataLoaded);
        } else {
          console.log('-- data is up to date --');
          $scope.startFireBase(function () {
            $rootScope.fireBaseReady = true;
            $scope.saveToFireBase(saveObject, 'leagueTables');
          });
        }

        $rootScope.loading = false;

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * init
       */
      var saveObject;

      /**
       * init
       */
      var init = function () {

        $scope.dataKeyName = 'leagueTables';
        $rootScope.loading = true;

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(fireBaseLoaded);

        }

      };

      init();

    });

})();
