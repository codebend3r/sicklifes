/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('tablesCtrl', function ($scope, apiFactory, $rootScope, $stateParams, updateDataUtils, textManipulator, momentService, localStorage) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> tablesCtrl');

      $rootScope.loading = true;

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

      /**
       *
       * @param httpData
       */
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

        var saveObject = {
          _syncedFrom: 'tablesCtrl',
          _lastSyncedOn: momentService.syncDate(),
          liga: $scope.allLeagues[0].source,
          epl: $scope.allLeagues[1].source,
          seri: $scope.allLeagues[2].source,
          chlg: $scope.allLeagues[3].source,
          uefa: $scope.allLeagues[4].source
        };

        $scope.saveToFireBase(saveObject, 'leagueTables');

      };

      /**
       *
       * @param data
       */
      var loadData = function (data) {

        $scope.allLeagues[0].source = data.liga;
        $scope.allLeagues[1].source = data.epl;
        $scope.allLeagues[2].source = data.seri;
        $scope.allLeagues[3].source = data.chlg;
        $scope.allLeagues[4].source = data.uefa;

        $scope.setSelectedLeague();

        var saveObject = {
          _syncedFrom: 'tablesCtrl',
          _lastSyncedOn: momentService.syncDate(),
          liga: $scope.allLeagues[0].source,
          epl: $scope.allLeagues[1].source,
          seri: $scope.allLeagues[2].source,
          chlg: $scope.allLeagues[3].source,
          uefa: $scope.allLeagues[4].source
        };

        if (momentService.isHoursAgo(data._lastSyncedOn, saveObject)) {

          console.log('-- data is too old --');
          //$scope.updateTablesFromHTTP(httpDataLoaded);

        } else {

          console.log('-- data is up to date --');

        }

        $rootScope.loading = false;

        $rootScope.lastSyncDate = data._lastSyncedOn;

        $rootScope.source = 'firebase';

        // map groups

        if ($scope.selectedLeague.slug === 'uefa') {

          console.log('EURO LEAGUE');

          var groupA = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group A';
          });

          var groupB = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group B';
          });

          var groupC = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group C';
          });

          var groupD = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group D';
          });

          var groupE = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group E';
          });

          var groupF = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group F';
          });

          var groupG = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group G';
          });

          var groupH = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group H';
          });

          var groupI = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group I';
          });

          var groupJ = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group J';
          });

          var groupK = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group K';
          });

          var groupL = _.filter(saveObject.uefa, function (team) {
            return team.group === 'Group L';
          });

          $scope.groupTables = [
            {
              groupName: 'Group A',
              teams: groupA
            },
            {
              groupName: 'Group B',
              teams: groupB
            },
            {
              groupName: 'Group C',
              teams: groupC
            },
            {
              groupName: 'Group D',
              teams: groupD
            },
            {
              groupName: 'Group E',
              teams: groupE
            },
            {
              groupName: 'Group F',
              teams: groupF
            },
            {
              groupName: 'Group G',
              teams: groupG
            },
            {
              groupName: 'Group H',
              teams: groupH
            },
            {
              groupName: 'Group I',
              teams: groupI
            },
            {
              groupName: 'Group J',
              teams: groupJ
            },
            {
              groupName: 'Group K',
              teams: groupK
            },
            {
              groupName: 'Group L',
              teams: groupL
            }
          ];

        } else if ($scope.selectedLeague.slug === 'chlg') {

          console.log('CHAMPIONS LEAGUE');

          var groupA = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group A';
          });

          var groupB = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group B';
          });

          var groupC = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group C';
          });

          var groupD = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group D';
          });

          var groupE = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group E';
          });

          var groupF = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group F';
          });

          var groupG = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group G';
          });

          var groupH = _.filter(saveObject.chlg, function (team) {
            return team.group === 'Group H';
          });

          $scope.groupTables = [
            {
              groupName: 'Group A',
              teams: groupA
            },
            {
              groupName: 'Group B',
              teams: groupB
            },
            {
              groupName: 'Group C',
              teams: groupC
            },
            {
              groupName: 'Group D',
              teams: groupD
            },
            {
              groupName: 'Group E',
              teams: groupE
            },
            {
              groupName: 'Group F',
              teams: groupF
            },
            {
              groupName: 'Group G',
              teams: groupG
            },
            {
              groupName: 'Group H',
              teams: groupH
            }
          ];

        }

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * init
       */
      var init = function () {

        $scope.dataKeyName = 'leagueTables';

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined(localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadData(localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');

          apiFactory.getApiData('leagueTables')
            .then(loadData);

        }

      };

      init();

    });

})();
