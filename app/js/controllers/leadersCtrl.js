/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leadersCtrl', function ($scope, $state, $stateParams, $localStorage, updateDataUtils, $rootScope, momentService, apiFactory, textManipulator, managersService, scoringLeaders) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> leadersCtrl');

      /**
       * TODO
       */
      $scope.updateLeaders = function () {

        console.log('leadersCtrl --> updateLeaders');

        apiFactory.getAllGoalLeaders(mapLeagueLeaders);

      };

      /**
       * map the http response to leagueLeaders array
       */
      var mapLeagueLeaders = function (result) {

        console.log('mapLeagueLeaders');

        $scope.leagueLeaders = _.map(result.data.Goals, function (data) {

          return {
            id: data.player.id,
            owner: angular.isUndefinedOrNull(managersService.findPlayerInManagers(data.player.id).manager) ? 'Free Agent' : managersService.findPlayerInManagers(data.player.id).manager.managerName,
            rank: data.ranking_tie ? 'T' + data.ranking : data.ranking,
            goals: data.stat,
            logo: data.team.logos.small,
            playerName: textManipulator.formattedFullName(data.player.first_name, data.player.last_name),
            teamName: data.team.full_name
          };

        });

        $scope.setSelectedLeague();

        $rootScope.loading = false;

        var saveObject = {};
        saveObject._syncedFrom = 'leadersCtrl';
        saveObject.leagues = {};
        saveObject.leagues[$stateParams.leagueName] = {
          goalLeaders: $scope.leagueLeaders,
          _lastSyncedOn: momentService.syncDate()
        };

        if ($rootScope.scoringLeaders) {
          _.defaults(saveObject.leagues, $rootScope.scoringLeaders.leagues);
        }

        console.log('updating league leaders for', $stateParams.leagueName);

        $scope.saveToFireBase(saveObject, 'scoringLeaders');

      };

      /**
       * when firebase data is loaded
       * @param firebaseObj
       */
      var loadData = function () {

        $scope.setSelectedLeague();
        $scope.leagueLeaders = scoringLeaders.leagues[$stateParams.leagueName].goalLeaders;
        $rootScope.loading = false;

      };

      loadData();

    });

})();
