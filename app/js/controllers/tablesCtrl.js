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
          text: 'Rank'
        },
        {
          text: 'Team'
        },
        {
          text: 'Record'
        },
        {
          text: 'GP'
        },
        {
          text: 'F'
        },
        {
          text: 'A'
        },
        {
          text: 'Points'
        }
      ];

      /**
       * table sort function
       */
      $scope.groupPosition = function (team) {
        return ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J'].indexOf(team.group);
      };

      /**
       * table sort function
       */
      $scope.groupByRank = function (team) {
        return team.rank;
      };

      /**
       * makes a request to get all the tables data
       */
      $scope.updateTables = function() {

        $scope.updateTablesFromHTTP(httpDataLoaded);

      };

      /**
       * makes http request from thescore.ca API
       * @param httpData
       */
      var httpDataLoaded = function (httpData) {

        console.log('///////////////////');
        console.log('httpDataLoaded --> httpData:', httpData);
        console.log('///////////////////');

        $scope.loading = false;

        $scope.allLeagues[0].source = httpData[0].data;
        $scope.allLeagues[1].source = httpData[1].data;
        $scope.allLeagues[2].source = httpData[2].data;
        $scope.allLeagues[3].source = httpData[3].data;
        $scope.allLeagues[4].source = httpData[4].data;

        $scope.setSelectedLeague();

        // after http request start firebase so we can save later
        $scope.startFireBase(function (firebaseData) {

          $scope.fireBaseReady = true;

          debugger;

          //$scope.managerData = $scope.populateManagersData(firebaseData);

          //saveObject = {
          //  _syncedFrom: 'leagusCtrl',
          //  _lastSyncedOn: $momentService.syncDate(),
          //  liga: $scope.allLeagues[0].source,
          //  epl: $scope.allLeagues[1].source,
          //  seri: $scope.allLeagues[2].source,
          //  chlg: $scope.allLeagues[3].source,
          //  uefa: $scope.allLeagues[4].source
          //};
          //
          //$scope.saveToFireBase(saveObject, 'leagueTables');

        });

      };

      /**
       * callback for when firebase data is loaded
       * @param firebaseData
       */
      var fireBaseLoaded = function (firebaseData) {

        console.log('///////////////////');
        console.log('fireBaseLoaded --> firebaseData:', firebaseData[$scope.dataKeyName]);
        console.log('///////////////////');

        $scope.fireBaseReady = true;

        $scope.allLeagues[0].source = firebaseData.leagueTables.liga;
        $scope.allLeagues[1].source = firebaseData.leagueTables.epl;
        $scope.allLeagues[2].source = firebaseData.leagueTables.seri;
        $scope.allLeagues[3].source = firebaseData.leagueTables.chlg;
        $scope.allLeagues[4].source = firebaseData.leagueTables.uefa;

        $scope.setSelectedLeague();

        $scope.managerData = $scope.populateManagersData(firebaseData);

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
          $rootScope.loading = false;
          $scope.saveToFireBase(saveObject, $scope.dataKeyName);
        }

      };

      /**
       * read data from local storage
       * @param localData
       */
      var loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('///////////////////');

        $scope.allLeagues[0].source = localData.liga;
        $scope.allLeagues[1].source = localData.epl;
        $scope.allLeagues[2].source = localData.seri;
        $scope.allLeagues[3].source = localData.chlg;
        $scope.allLeagues[4].source = localData.uefa;

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
          $rootScope.loading = false;
          $scope.startFireBase(function () {

            $rootScope.fireBaseReady = true;

            //$scope.saveToFireBase(saveObject, 'leagueTables');

          });
        }

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
