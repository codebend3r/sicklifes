/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leadersCtrl', function ($scope, $state, $http, $stateParams, $localStorage, $rootScope, $momentService) {

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
              teamName: data.team.full_name
            };

          });

          console.log('after http data is loaded, save to firebase');

          prepareForFirebase();

        });

      };

      /**
       * extends league object and makes the call to firebase
       */
      var prepareForFirebase = function () {

        saveObject = {};
        saveObject._syncedFrom = 'leadersCtrl';
        saveObject._lastSyncedOn = $momentService.syncDate();
        saveObject.leagues = {};
        saveObject.leagues[$stateParams.leagueName] = $scope.leagueLeaders;

        if (firebaseData[$scope.dataKeyName]) {
          _.defaults(saveObject.leagues, firebaseData[$scope.dataKeyName].leagues);
        }

        $scope.saveToFireBase(saveObject, 'scoringLeaders');

      };

      /**
       * read data from local storage
       * @param localData
       */
      $scope.loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('syncDate:', localData._lastSyncedOn);
        console.log('$stateParams.leagueName:', $stateParams.leagueName);
        console.log('///////////////////');

        $scope.allLeagues[0].source = localData.LIGA;
        $scope.allLeagues[1].source = localData.EPL;
        $scope.allLeagues[2].source = localData.SERI;
        $scope.allLeagues[3].source = localData.CHLG;
        $scope.allLeagues[4].source = localData.UEFA;

        $scope.setSelectedLeague();

        $scope.leagueLeaders = localData.leagues[$stateParams.leagueName];

        $scope.startFireBase(function (firebaseObj) {

          firebaseData = firebaseObj;
          $rootScope.fireBaseReady = true;
          prepareForFirebase();

        });

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * TODO
       */
      var saveObject = {};

      /**
       * TODO
       */
      var firebaseData = null;

      /**
       * TODO
       */
      var init = function () {

        $scope.dataKeyName = 'scoringLeaders';

        if (angular.isDefined($rootScope[$scope.dataKeyName]) && angular.isDefined($rootScope[$scope.dataKeyName].leagues[$stateParams.leagueName])) {

          console.log('load from $rootScope');
          $scope.loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName]) && angular.isDefined($localStorage[$scope.dataKeyName].leagues[$stateParams.leagueName])) {

          console.log('load from local storage');
          $scope.loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(function (firebaseObj) {

            firebaseData = firebaseObj;

            $rootScope.fireBaseReady = true;

            if (angular.isDefined(firebaseObj.leagueTables)) {
              $scope.allLeagues[0].source = firebaseObj.leagueTables.LIGA;
              $scope.allLeagues[1].source = firebaseObj.leagueTables.EPL;
              $scope.allLeagues[2].source = firebaseObj.leagueTables.SERI;
              $scope.allLeagues[3].source = firebaseObj.leagueTables.CHLG;
              $scope.allLeagues[4].source = firebaseObj.leagueTables.UEFA;
            }

            $scope.setSelectedLeague();

            if (!angular.isUndefinedOrNull(firebaseObj[$scope.dataKeyName]) && !angular.isUndefinedOrNull(firebaseObj[$scope.dataKeyName].leagues) && !angular.isUndefinedOrNull(firebaseObj[$scope.dataKeyName].leagues[$stateParams.leagueName])) {

              console.log('defined in firebase', firebaseData[$scope.dataKeyName].leagues);
              $scope.leagueLeaders = firebaseData[$scope.dataKeyName].leagues[$stateParams.leagueName];

            } else {

              console.log('not defined in firebase');
              $scope.updateFromHTTP();

            }

          });

        }

      };

      init();

    });

})();
