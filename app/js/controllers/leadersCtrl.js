/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

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

        console.log('prepareForFirebase()');

        saveObject = {};
        saveObject._syncedFrom = 'leadersCtrl';
        saveObject._lastSyncedOn = $momentService.syncDate();
        saveObject.leagues = {};
        saveObject.leagues[$stateParams.leagueName] = $scope.leagueLeaders;
        //saveObject.leagues[$stateParams.leagueName] = {};

        //console.log('saveObject', saveObject);

        //var mergeLeagueObj1 = _.defaults(null, firebaseData, saveObject);
        //var mergeLeagueObj2 = _.defaults(null, saveObject, firebaseData);
        //var mergeLeagueObj3 = _.defaults(saveObject, firebaseData);
        //var mergeLeagueObj4 = _.defaults(firebaseData, saveObject);

        //_.defaults(saveObject, firebaseData);

        //console.log('mergeLeagueObj1', mergeLeagueObj1);
        //console.log('mergeLeagueObj2', mergeLeagueObj2);
        //console.log('mergeLeagueObj3', mergeLeagueObj3);
        //console.log('mergeLeagueObj4', mergeLeagueObj4);

        //console.log('> saveObject', saveObject);

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

        $scope.leagueLeaders = localData[$stateParams.leagueName];

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

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          $scope.loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          $scope.loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(function (firebaseObj) {

            firebaseData = firebaseObj;

            $rootScope.fireBaseReady = true;

            console.log('1', firebaseData[$scope.dataKeyName]);

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
