(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leaguesCtrl', function ($scope, $stateParams, $state, $apiFactory, $localStorage, $location, $updateDataUtils, $momentService, $rootScope, $textManipulator, $fireBaseService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> leaguesCtrl');

      /**
       * checks url for url param for key value pair of admin=true
       */
      $scope.admin = $location.search().admin;

      /**
       * TODO
       */
      $scope.allRequest = [];

      /**
       * select box changes function
       */
      $scope.changeLeague = function (league) {
        //console.log('> leagueName', league);
        //$state.go('tables', {leagueName: league.className});
      };

      /**
       * sets the league
       */
      $scope.setSelectedLeague = function () {

        var selectedLeagueIndex = 0;

        _.some($scope.allLeagues, function (l, index) {
          if (l.className === $stateParams.leagueName) {
            selectedLeagueIndex = index;
            return true;
          }
        });

        $scope.selectedLeague = $scope.allLeagues[selectedLeagueIndex];
        $scope.leagueName = $scope.selectedLeague.className;

      };

      /**
       * tabs data
       */
      $scope.tabData = [
        {
          heading: 'Tables',
          route: 'leagues.tables',
          active: true
        },
        {
          heading: 'Leaders',
          route: 'leagues.leaders'
        }
      ];

      /**
       * get data through HTTP request
       */
      $scope.updateFromHTTP = function () {

        $updateDataUtils.updateLeagueTables()
          .then($scope.httpDataLoaded);

      };

      /**
       * all leagues array
       */
      $scope.allLeagues = [
        {
          name: $textManipulator.leagueLongNames.liga,
          source: null,
          className: 'liga',
          img: $textManipulator.leagueImages.liga
        },
        {
          name: $textManipulator.leagueLongNames.epl,
          source: null,
          className: 'epl',
          img: $textManipulator.leagueImages.epl
        },
        {
          name: $textManipulator.leagueLongNames.seri,
          source: null,
          className: 'seri',
          img: $textManipulator.leagueImages.seri
        },
        {
          name: $textManipulator.leagueLongNames.chlg,
          source: null,
          className: 'chlg',
          img: $textManipulator.leagueImages.chlg
        },
        {
          name: $textManipulator.leagueLongNames.euro,
          source: null,
          className: 'europa',
          img: $textManipulator.leagueImages.euro
        }
      ];

      /**
       * makes http request from thescore.ca API
       * @param httpData
       */
      $scope.httpDataLoaded = function (httpData) {

        console.log('///////////////////');
        console.log('$HTTP --> httpData:', httpData);
        console.log('///////////////////');

        $scope.allLeagues[0].source = httpData[0].data;
        $scope.allLeagues[1].source = httpData[1].data;
        $scope.allLeagues[2].source = httpData[2].data;
        $scope.allLeagues[3].source = httpData[3].data;
        $scope.allLeagues[4].source = httpData[4].data;

        $scope.setSelectedLeague();

        $scope.loading = false;

        // after http request start firebase so we can save later
        $scope.startFireBase(function () {

          $scope.fireBaseReady = true;

          saveObject = {
            _syncedFrom: 'leagusCtrl',
            _lastSyncedOn: $momentService.syncDate(),
            LIGA: $scope.allLeagues[0].source,
            EPL: $scope.allLeagues[1].source,
            SERI: $scope.allLeagues[2].source,
            CHLG: $scope.allLeagues[3].source,
            UEFA: $scope.allLeagues[4].source
          };

          $scope.saveToFireBase(saveObject, 'leagueTables');

        });

      };

      /**
       *
       * @param firebaseData
       */
      $scope.fireBaseLoaded = function (firebaseData) {

        $scope.fireBaseReady = true;

        console.log('///////////////////');
        console.log('FB --> firebaseData:', firebaseData[dataKeyName]);
        console.log('syncDate:', firebaseData[dataKeyName]._lastSyncedOn);
        console.log('///////////////////');

        $scope.allLeagues[0].source = firebaseData.leagueTables.LIGA;
        $scope.allLeagues[1].source = firebaseData.leagueTables.EPL;
        $scope.allLeagues[2].source = firebaseData.leagueTables.SERI;
        $scope.allLeagues[3].source = firebaseData.leagueTables.CHLG;
        $scope.allLeagues[4].source = firebaseData.leagueTables.UEFA;

        $scope.setSelectedLeague();

        saveObject = {
          _syncedFrom: 'leagusCtrl',
          _lastSyncedOn: $momentService.syncDate(),
          LIGA: $scope.allLeagues[0].source,
          EPL: $scope.allLeagues[1].source,
          SERI: $scope.allLeagues[2].source,
          CHLG: $scope.allLeagues[3].source,
          UEFA: $scope.allLeagues[4].source
        };

        if ($scope.checkYesterday(firebaseData[dataKeyName]._lastSyncedOn, saveObject)) {
          $scope.updateFromHTTP();
        } else {
          $scope.startFireBase(function () {
            $scope.fireBaseReady = true;
            $scope.saveToFireBase(saveObject, 'leagueTables');
          });
        }

      };

      /**
       * read data from local storage
       * @param localData
       */
      $scope.loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('syncDate:', localData._lastSyncedOn);
        console.log('///////////////////');

        $scope.allLeagues[0].source = localData.LIGA;
        $scope.allLeagues[1].source = localData.EPL;
        $scope.allLeagues[2].source = localData.SERI;
        $scope.allLeagues[3].source = localData.CHLG;
        $scope.allLeagues[4].source = localData.UEFA;

        $scope.setSelectedLeague();

        saveObject = {
          _syncedFrom: 'leagusCtrl',
          _lastSyncedOn: $momentService.syncDate(),
          LIGA: $scope.allLeagues[0].source,
          EPL: $scope.allLeagues[1].source,
          SERI: $scope.allLeagues[2].source,
          CHLG: $scope.allLeagues[3].source,
          UEFA: $scope.allLeagues[4].source
        };

        if ($scope.checkYesterday(localData._lastSyncedOn, saveObject)) {
          $scope.updateFromHTTP();
        } else {
          $scope.startFireBase(function () {
            $scope.fireBaseReady = true;
            $scope.saveToFireBase(saveObject, 'leagueTables');
          });
        }

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      var saveObject;

      /**
       * init
       */
      var init = function () {

        console.log('leaguesCtrl - init');
        console.log('> leagueName', $stateParams.leagueName);

        $scope.dataKeyName = 'leagueTables';

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          $scope.loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          $scope.loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(fireBaseLoaded);

        }

      };

      init();


    });

})();
