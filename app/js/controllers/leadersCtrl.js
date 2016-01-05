/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leadersCtrl', function ($scope, $state, $stateParams, $localStorage, updateDataUtils, $rootScope, momentService, apiFactory, textManipulator) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> leadersCtrl');

      /**
       * TODO
       */
      $scope.updateLeaders = function () {

        updateDataUtils.updateCoreData(function () {
          $scope.updateLeadersFromHTTP(mapLeagueLeaders);
        });

      };

      var findOwner = function (playerId) {

        var managerName = 'Free Agent';

        _.some($rootScope.managersData.data, function (manager) {

          if (angular.isDefined(manager.players[playerId])) {

            managerName = manager.managerName;
            return true;

          }

        });

        return managerName;

      };

      /**
       * map the http response to leagueLeaders array
       */
      var mapLeagueLeaders = function (result) {

        console.log('mapLeagueLeaders');

        var self = this;

        $scope.leagueLeaders = _.map(result.data.Goals, function (data) {

          return {
            id: data.player.id,
            owner: findOwner.call(self, data.player.id),
            rank: data.ranking_tie ? 'T' + data.ranking : data.ranking,
            goals: data.stat,
            logo: data.team.logos.small,
            playerName: textManipulator.formattedFullName(data.player.first_name, data.player.last_name),
            teamName: data.team.full_name
          };

        });

        $scope.setSelectedLeague();

        $rootScope.loading = false;

        $scope.startFireBase(function () {

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

        });

      };

      /**
       * TODO
       * @returns {boolean}
       */
      var existsInFireBase = function (data) {

        return !angular.isUndefinedOrNull(data)
          && !angular.isUndefinedOrNull(data.leagues)
          && !angular.isUndefinedOrNull(data.leagues[$stateParams.leagueName]);

      };

      /**
       * when firebase data is loaded
       * @param firebaseObj
       */
      var loadData = function (data) {

        if (angular.isDefined(data.leagues)
          && angular.isDefined(data.leagues[$stateParams.leagueName])
          && momentService.isHoursAgo(data.leagues[$stateParams.leagueName]._lastSyncedOn)) {

          console.log('-- data is too old --');
          //$scope.updateLeadersFromHTTP(mapLeagueLeaders);
          $scope.setSelectedLeague();
          $scope.leagueLeaders = data.leagues[$stateParams.leagueName].goalLeaders;
          $rootScope.loading = false;

        } else if (existsInFireBase(data)) {

          console.log('-- data is up to date & exists in firebase --');
          $scope.setSelectedLeague();
          $scope.leagueLeaders = data.leagues[$stateParams.leagueName].goalLeaders;
          $rootScope.loading = false;

        } else {

          console.log('-- data not available in firebase --');
          $scope.updateLeadersFromHTTP(mapLeagueLeaders);

        }

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * TODO
       */
      var init = function () {

        $scope.dataKeyName = 'scoringLeaders';

        if (angular.isDefined($rootScope[$scope.dataKeyName]) && angular.isDefined($rootScope[$scope.dataKeyName].leagues[$stateParams.leagueName])) {

          console.log('load from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName]) && angular.isDefined($localStorage[$scope.dataKeyName].leagues[$stateParams.leagueName])) {

          console.log('load from local storage');
          loadData($localStorage[$scope.dataKeyName]);

        } else {

          apiFactory.getApiData('scoringLeaders')
            .then(loadData);

        }

      };

      init();

    });

})();
