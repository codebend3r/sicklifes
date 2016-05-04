/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leadersCtrl', function ($scope, $log, $state, $stateParams, $localStorage, updateDataUtils, $rootScope, momentService, apiFactory, textManipulator, managersService, leagueLeaders) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $log.debug('--> leadersCtrl');

      var mapLeaders = function (data) {
        return {
          id: data.player.id,
          owner: angular.isUndefinedOrNull(managersService.findPlayerInManagers(data.player.id).manager) ? 'Free Agent' : managersService.findPlayerInManagers(data.player.id).manager.managerName,
          rank: data.ranking_tie ? 'T' + data.ranking : data.ranking,
          goals: data.stat,
          logo: data.team.logos.small,
          playerName: textManipulator.formattedFullName(data.player.first_name, data.player.last_name),
          teamName: data.team.full_name
        };
      };

      var loadData = function () {

        $scope.setSelectedLeague();
        $scope.leagueLeaders = leagueLeaders.leagues[$stateParams.leagueName].goalLeaders;
        $rootScope.loading = false;

      };

      /**
       * map the http response to leagueLeaders array
       */
      var mapLeagueLeaders = function (arrayOfResults) {

        var saveObject = {};
        saveObject.leagues = {};

        _.each(arrayOfResults, function (result) {

          saveObject.leagues[result.slug] = {
            goalLeaders: _.map(result.data.Goals, mapLeaders),
            _lastSyncedOn: momentService.syncDate()
          };

          if (result.slug === $stateParams.leagueName) {

            $scope.leagueLeaders = _.map(result.data.Goals, mapLeaders);

          }

        });

        $scope.setSelectedLeague();

        $rootScope.loading = false;

        $log.debug('saveObject', saveObject);

        $scope.saveToFireBase(saveObject, 'leagueLeaders');

      };

      /**
       * TODO
       */
      $scope.updateLeaders = function () {

        $log.debug('leadersCtrl --> updateLeaders');

        apiFactory.getAllGoalLeaders().then(mapLeagueLeaders);

      };

      loadData();

    });

})();
