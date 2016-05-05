/**
 * Created by Bouse on 02/09/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('tablesCtrl', function ($scope, $rootScope, $log, $stateParams, $localStorage, apiFactory, updateDataUtils, textManipulator, arrayMappers, momentService, leagueTables) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $log.debug('--> tablesCtrl');

      $rootScope.loading = true;

      /**
       * @description table sort function
       */
      $scope.groupPosition = function (team) {
        return ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J'].indexOf(team.group);
      };

      /**
       * @description table sort function
       */
      $scope.groupByRank = function (team) {
        return team.rank;
      };

      /**
       * @description makes a request to get all the tables data
       */
      $scope.updateTables = function () {

        apiFactory.getLeagueTables().then(mapLeagueTables);

      };

      /**
       * @description
       * @param httpData
       */
      var mapLeagueTables = function (result) {

        $log.debug('///////////////////');
        $log.debug('httpDataLoaded --> result:', result);
        $log.debug('///////////////////');

        $rootScope.loading = false;

        $scope.allLeagues[0].source = _.map(result[0].data, arrayMappers.tableMap);
        $scope.allLeagues[1].source = _.map(result[1].data, arrayMappers.tableMap);
        $scope.allLeagues[2].source = _.map(result[2].data, arrayMappers.tableMap);
        $scope.allLeagues[3].source = _.map(result[3].data, arrayMappers.tableMap);
        $scope.allLeagues[4].source = _.map(result[4].data, arrayMappers.tableMap);

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

        //debugger;

        $scope.saveToFireBase(saveObject, 'leagueTables');

      };

      /**
       * @name loadData
       * @param data
       */
      var loadData = function () {

        $scope.allLeagues[0].source = leagueTables.liga;
        $scope.allLeagues[1].source = leagueTables.epl;
        $scope.allLeagues[2].source = leagueTables.seri;
        $scope.allLeagues[3].source = leagueTables.chlg;
        $scope.allLeagues[4].source = leagueTables.uefa;

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

        if (momentService.isHoursAgo(leagueTables._lastSyncedOn, saveObject)) {

          $log.debug('-- data is too old --');
          //$scope.updateTablesFromHTTP(httpDataLoaded);

        } else {

          $log.debug('-- data is up to date --');

        }

        $rootScope.loading = false;

        $rootScope.lastSyncDate = leagueTables._lastSyncedOn;

        $rootScope.source = 'firebase';

        // map groups

        if ($scope.selectedLeague.slug === 'uefa') {

          $log.debug('EURO LEAGUE');

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

          $log.debug('CHAMPIONS LEAGUE');

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

      loadData();

    });

})();
