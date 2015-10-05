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

      $rootScope.loading = true;

      /**
       * header for custom-table directive
       */
      $scope.leagueTableHeader = [
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
      $scope.updateTables = function () {

        $scope.updateTablesFromHTTP(httpDataLoaded);

      };

      var httpDataLoaded = function (httpData) {

        console.log('///////////////////');
        console.log('httpDataLoaded --> httpData:', httpData);
        console.log('///////////////////');

        $rootScope.loading = false;

        $scope.allLeagues[0].source = httpData[0].data;
        $scope.allLeagues[1].source = httpData[1].data;
        $scope.allLeagues[2].source = httpData[2].data;
        $scope.allLeagues[3].source = httpData[3].data;
        $scope.allLeagues[4].source = httpData[4].data;

        $scope.setSelectedLeague();

        // after http request start firebase so we can save later
        $scope.startFireBase(function (firebaseData) {

          $rootScope.fireBaseReady = true;

          $scope.managerData = $scope.populateManagersData(firebaseData.managersData);

          var saveObject = {
            _syncedFrom: 'tablesCtrl',
            _lastSyncedOn: $momentService.syncDate(),
            liga: $scope.allLeagues[0].source,
            epl: $scope.allLeagues[1].source,
            seri: $scope.allLeagues[2].source,
            chlg: $scope.allLeagues[3].source,
            uefa: $scope.allLeagues[4].source
          };

          console.log('saveObject', saveObject);

          $scope.saveToFireBase(saveObject, 'leagueTables');

        });

      };

      var loadData = function (data) {

        console.log('///////////////////');
        console.log('data:', data);
        console.log('///////////////////');

        $scope.allLeagues[0].source = data.liga;
        $scope.allLeagues[1].source = data.epl;
        $scope.allLeagues[2].source = data.seri;
        $scope.allLeagues[3].source = data.chlg;
        $scope.allLeagues[4].source = data.uefa;

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

        if ($momentService.isHourAgo(data._lastSyncedOn, saveObject)) {

          console.log('-- data is too old --');
          $rootScope.loading = false;
          $scope.updateTablesFromHTTP(httpDataLoaded);

        } else {

          console.log('-- data is up to date --');
          $rootScope.loading = false;

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

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadData($localStorage[$scope.dataKeyName]);

        } else {

          if ($rootScope.fireBaseReady) {

            //console.log('$rootScope.firebaseData', $rootScope.firebaseData);
            console.log('load from firebase - OLD');
            loadData($rootScope.firebaseData[$scope.dataKeyName]);

          } else {

            $scope.startFireBase(function () {

              console.log('load from firebase - NEW');
              //console.log('$rootScope.firebaseData', $rootScope.firebaseData);
              loadData($rootScope.firebaseData[$scope.dataKeyName]);

            });

          }

        }

      };

      init();

    });

})();
