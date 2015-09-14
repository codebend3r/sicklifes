/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leadersCtrl', function ($scope, $state, $stateParams, $localStorage, $rootScope, $momentService, $textManipulator) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> leadersCtrl');

      /**
       * whether data is still loading
       */
      $scope.loading = true;

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
      var mapLeagueLeaders = function (result) {

        $scope.leagueLeaders = _.map(result.data.Goals, function (data) {

          return {
            id: data.id,
            rank: data.ranking,
            goals: data.stat,
            logo: data.team.logos.small,
            playerName: $textManipulator.formattedFullName(data.player.first_name, data.player.last_name),
            teamName: data.team.full_name
          };

        });

        $scope.setSelectedLeague();

        $rootScope.loading = false;

        $scope.startFireBase(function (firebaseObj) {
          firebaseData = firebaseObj;
          $rootScope.fireBaseReady = true;
          prepareForFirebase();
        });

      };

      /**
       * extends league object and makes the call to firebase
       */
      var prepareForFirebase = function () {

        saveObject = {};
        saveObject._syncedFrom = 'leadersCtrl';
        saveObject.leagues = {};
        saveObject.leagues[$stateParams.leagueName] = {
          goalLeaders: $scope.leagueLeaders,
          _lastSyncedOn: $momentService.syncDate()
        };

        if (firebaseData[$scope.dataKeyName]) {
          _.defaults(saveObject.leagues, firebaseData[$scope.dataKeyName].leagues);
        }

        console.log('saveObject', saveObject);

        $scope.saveToFireBase(saveObject, 'scoringLeaders');

      };

      var existsInFireBase = function () {

        return !angular.isUndefinedOrNull(firebaseData[$scope.dataKeyName])
          && !angular.isUndefinedOrNull(firebaseData[$scope.dataKeyName].leagues)
          && !angular.isUndefinedOrNull(firebaseData[$scope.dataKeyName].leagues[$stateParams.leagueName]);

      };

      /**
       * when firebase data is loaded
       */
      var firebaseLoaded = function (firebaseObj) {

        firebaseData = firebaseObj;

        console.log('///////////////////');
        console.log('FB --> firebaseData:', firebaseData[$scope.dataKeyName]);
        //console.log($stateParams.leagueName, 'last synced on', firebaseData[$scope.dataKeyName].leagues[$stateParams.leagueName]._lastSyncedOn);
        console.log('///////////////////');

        $rootScope.fireBaseReady = true;

        // leagueTables is the key name
        //if (angular.isDefined(firebaseObj.leagueTables)) {
        //  $scope.allLeagues[0].source = firebaseObj.leagueTables.LIGA;
        //  $scope.allLeagues[1].source = firebaseObj.leagueTables.EPL;
        //  $scope.allLeagues[2].source = firebaseObj.leagueTables.SERI;
        //  $scope.allLeagues[3].source = firebaseObj.leagueTables.CHLG;
        //  $scope.allLeagues[4].source = firebaseObj.leagueTables.UEFA;
        //}

        if (angular.isDefined(firebaseData[$scope.dataKeyName].leagues)
          && angular.isDefined(firebaseData[$scope.dataKeyName].leagues[$stateParams.leagueName])
          && $scope.checkYesterday(firebaseData[$scope.dataKeyName].leagues[$stateParams.leagueName]._lastSyncedOn)) {

          console.log('-- data is too old --');
          $scope.updateLeadersFromHTTP(mapLeagueLeaders);

        } else if (existsInFireBase()) {

          console.log('-- data is up to date & exists in firebase --');
          $scope.setSelectedLeague();
          $scope.leagueLeaders = firebaseData[$scope.dataKeyName].leagues[$stateParams.leagueName].goalLeaders;
          $rootScope.loading = false;

        } else {

          console.log('-- data not available in firebase --');
          $scope.updateLeadersFromHTTP(mapLeagueLeaders);

        }

      };

      /**
       * read data from local storage
       * @param localData
       */
      $scope.loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData.leagues[$stateParams.leagueName]);
        console.log($stateParams.leagueName, 'last synced on', localData.leagues[$stateParams.leagueName]._lastSyncedOn);
        console.log('///////////////////');

        //$scope.allLeagues[0].source = localData.LIGA;
        //$scope.allLeagues[1].source = localData.EPL;
        //$scope.allLeagues[2].source = localData.SERI;
        //$scope.allLeagues[3].source = localData.CHLG;
        //$scope.allLeagues[4].source = localData.UEFA;

        $scope.setSelectedLeague();

        $scope.leagueLeaders = localData.leagues[$stateParams.leagueName].goalLeaders;

        if ($scope.checkYesterday(localData.leagues[$stateParams.leagueName]._lastSyncedOn)) {
          console.log('-- data is too old --');
          $scope.updateLeadersFromHTTP(mapLeagueLeaders);
        } else {
          console.log('-- data is up to date --');
          $rootScope.loading = false;
          $scope.startFireBase(function (firebaseObj) {
            firebaseData = firebaseObj;
            $rootScope.fireBaseReady = true;
            prepareForFirebase();
          });
        }

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
          $scope.startFireBase(firebaseLoaded);

        }

      };

      init();

    });

})();
