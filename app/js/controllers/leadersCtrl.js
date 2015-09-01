/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  console.log('app/controllers/leadersCtrl/js');

  angular.module('sicklifes')

    .controller('leadersCtrl', function ($scope, $http, $stateParams, $localStorage, $rootScope, $momentService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> leadersCtrl');

      /**
       * TODO
       */
      $scope.tableHeader = [
        {
          text: 'Ranking'
        },
        {
          text: 'Team'
        },
        {
          text: 'Player'
        },
        {
          text: 'Goals'
        }
      ];

      /**
       * TODO
       */
      $scope.updateFromHTTP = function () {

        console.log('--> updateFromHTTP');

        $http({
          url: 'http://api.thescore.com/' + $stateParams.leagueName + '/leaders?categories=Goals&season_type=regular',
          method: 'GET'
        }).then(function (result) {

          $scope.leagueLeaders = _.map(result.data.Goals, function (data) {

            return {
              id: data.id,
              rank: data.ranking,
              goals: data.stat,
              logo: data.team.logos.small,
              playerName: data.player.full_name,
              teamName: data.team.full_name,
            };

          });

          saveObject = {
            _syncedFrom: 'leadersCtrl',
            _lastSyncedOn: $momentService.syncDate(),
            leagueLeaders: $scope.leagueLeaders
          };

          $scope.saveToFireBase(saveObject, 'scoringLeaders');

        });

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * TODO
       */
      var saveObject;

      /**
       * TODO
       */
      var init = function () {

        $scope.dataKeyName = 'scoringLeaders';

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          //$scope.loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          //$scope.loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(function (firebaseObj) {

            $scope.fireBaseReady = true;

            if (angular.isUndefinedOrNull(firebaseObj[$scope.dataKeyName])) {

              console.log('not defined in firebase');
              $scope.updateFromHTTP();

            } else {

              console.log('defined in firebase');
              var leagueLeaders = firebaseData[$scope.dataKeyName];
              $scope.leagueLeaders = leagueLeaders;

            }

          });

        }

      };

      init();

    });

})();
