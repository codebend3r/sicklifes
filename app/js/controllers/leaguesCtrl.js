(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leaguesCtrl', function ($scope, $stateParams, $timeout, $apiFactory, $moment, $localStorage, $managersService, $q, $location, $updateDataUtils, $arrayMappers, $momentService, $rootScope, $textManipulator, $fireBaseService) {

      console.log('sicklifes --> leaguesCtrl');

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /**
       * TODO
       */
      $scope.loading = true;

      /**
       * TODO
       */
      $scope.fireBaseReady = false;

      /**
       * TODO
       */
      $scope.admin = $stateParams.admin;

      /**
       * TODO
       */
      $scope.leagueTableHeader = [
        {
          columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center small-hpadding',
          text: 'Rank'
        },
        {
          columnClass: 'col-md-6 col-sm-4 col-xs-6 small-hpadding',
          text: 'Team'
        },
        {
          columnClass: 'col-md-1 col-sm-4 hidden-xs text-center small-hpadding',
          text: 'Record'
        },
        {
          columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
          text: 'GP'
        },
        {
          columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
          text: 'F'
        },
        {
          columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
          text: 'A'
        },
        {
          columnClass: 'col-md-1 col-sm-2 col-xs-4 text-center small-hpadding',
          text: 'Points'
        }
      ];

      $scope.allRequest = [];

      $scope.changeLeague = function (league) {
        //
      };

      /**
       * sets data in the initialized firebase service
       */
      $scope.saveToFireBase = function () {

        if ($scope.fireBaseReady) {

          console.log('////////////////////////////////////');
          console.log('$scope.allLeagues:', $scope.allLeagues);
          console.log('////////////////////////////////////');

          var saveObject = {
            _syncedFrom: 'leaguesCtrl',
            _lastSyncedOn: $momentService.syncDate(),
            LIGA: $scope.allLeagues[0].source,
            EPL: $scope.allLeagues[1].source,
            SERI: $scope.allLeagues[2].source,
            CHLG: $scope.allLeagues[3].source,
            UEFA: $scope.allLeagues[4].source
          };

          $fireBaseService.saveToFireBase(saveObject, dataKeyName);

        } else {

          startFireBase();

        }

      };

      /**
       * get data through HTTP request
       */
      $scope.updateLeaguesData = function () {

        $updateDataUtils.updateLeagueTables()
          .then(httpDataLoaded);

      };

      /**
       * makes http request from thescore.ca API
       * @param httpData
       */
      var httpDataLoaded = function (httpData) {

        console.log('///////////////////');
        console.log('$HTTP --> httpData:', httpData);
        console.log('///////////////////');

        $scope.allLeagues = [
          {
            name: $textManipulator.leagueLongNames.liga,
            source: httpData[0].data,
            className: 'liga',
            img: $textManipulator.leagueImages.liga
          },
          {
            name: $textManipulator.leagueLongNames.epl,
            source: httpData[1].data,
            className: 'epl',
            img: $textManipulator.leagueImages.epl
          },
          {
            name: $textManipulator.leagueLongNames.seri,
            source: httpData[2].data,
            className: 'seri',
            img: $textManipulator.leagueImages.seri
          },
          {
            name: $textManipulator.leagueLongNames.chlg,
            source: httpData[3].data,
            className: 'chlg',
            img: $textManipulator.leagueImages.chlg
          },
          {
            name: $textManipulator.leagueLongNames.euro,
            source: httpData[4].data,
            className: 'europa',
            img: $textManipulator.leagueImages.euro
          }
        ];

        $scope.selectedLeague = $scope.allLeagues[0];

        $scope.loading = false;

        // after http request start firebase so we can save later
        startFireBase(function () {
          console.log('HTTP --> FIREBASE READY');
          $scope.fireBaseReady = true;
          $scope.saveToFireBase();
        });

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      var dataKeyName = 'leagueTables';

      /**
       * check to see if date is yesterday
       */
      var checkYesterday = function (syncDate) {

        if ($momentService.isPastYesterday(syncDate)) {
          console.log('checkYesterday() --> IS YESTERDAY');
          $scope.updateLeaguesData();
          return true;
        } else {
          console.log('checkYesterday() --> NOT YESTERDAY YET');
          $scope.loading = false;
          // no matter if it's yesterday or not, start firebase so we can save later
          startFireBase(function () {
            $scope.fireBaseReady = true;
            $scope.saveToFireBase();
          });
          return false;
        }

      };

      /**
       *
       * @param firebaseData
       */
      var fireBaseLoaded = function (firebaseData) {

        $scope.fireBaseReady = true;

        console.log('///////////////////');
        console.log('FB --> firebaseData:', firebaseData[dataKeyName]);
        console.log('///////////////////');

        $scope.allLeagues = [
          {
            name: $textManipulator.leagueLongNames.liga,
            source: firebaseData.leagueTables.LIGA,
            className: 'liga',
            img: $textManipulator.leagueImages.liga
          },
          {
            name: $textManipulator.leagueLongNames.epl,
            source: firebaseData.leagueTables.EPL,
            className: 'epl',
            img: $textManipulator.leagueImages.epl
          },
          {
            name: $textManipulator.leagueLongNames.seri,
            source: firebaseData.leagueTables.SERI,
            className: 'seri',
            img: $textManipulator.leagueImages.seri
          },
          {
            name: $textManipulator.leagueLongNames.chlg,
            source: firebaseData.leagueTables.CHLG,
            className: 'chlg',
            img: $textManipulator.leagueImages.chlg
          },
          {
            name: $textManipulator.leagueLongNames.euro,
            source: firebaseData.leagueTables.UEFA,
            className: 'europa',
            img: $textManipulator.leagueImages.euro
          }
        ];

        $scope.selectedLeague = $scope.allLeagues[0];

        console.log('syncDate:', firebaseData[dataKeyName]._lastSyncedOn);

        checkYesterday(firebaseData[dataKeyName]._lastSyncedOn);

      };

      /**
       * read data from local storage
       * @param localData
       */
      var loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('///////////////////');

        $scope.allLeagues = [
          {
            name: $textManipulator.leagueLongNames.liga,
            source: localData.LIGA,
            className: 'liga',
            img: $textManipulator.leagueImages.liga
          },
          {
            name: $textManipulator.leagueLongNames.epl,
            source: localData.EPL,
            className: 'epl',
            img: $textManipulator.leagueImages.epl
          },
          {
            name: $textManipulator.leagueLongNames.seri,
            source: localData.SERI,
            className: 'seri',
            img: $textManipulator.leagueImages.seri
          },
          {
            name: $textManipulator.leagueLongNames.chlg,
            source: localData.CHLG,
            className: 'chlg',
            img: $textManipulator.leagueImages.chlg
          },
          {
            name: $textManipulator.leagueLongNames.euro,
            source: localData.UEFA,
            className: 'europa',
            img: $textManipulator.leagueImages.euro
          }
        ];

        $scope.selectedLeague = $scope.allLeagues[0];

        console.log('syncDate:', localData._lastSyncedOn);

        checkYesterday(localData._lastSyncedOn);

      };

      /**
       * starts the process of getting data from firebase
       * @param callback
       */
      var startFireBase = function (callback) {

        console.log('--  firebase started --');
        if ($scope.fireBaseReady) {
          console.log('firebase previously loaded');
          callback();
        } else {
          $fireBaseService.initialize($scope);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.then(callback);
        }

      };

      /**
       * init
       */
      var init = function () {

        console.log('leaguesCtrl - init');

        if (angular.isDefined($rootScope[dataKeyName])) {

          console.log('load from $rootScope');
          loadFromLocal($rootScope[dataKeyName]);

        } else if (angular.isDefined($localStorage[dataKeyName])) {

          console.log('load from local storage');
          loadFromLocal($localStorage[dataKeyName]);

        } else {

          console.log('load from firebase');
          startFireBase(fireBaseLoaded);

        }

      };

      init();

    });

})();
