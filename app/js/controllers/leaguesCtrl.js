(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leaguesCtrl', function ($scope, $stateParams, $state, $apiFactory, $localStorage, $managersService, $location, $updateDataUtils, $arrayMappers, $momentService, $rootScope, $textManipulator, $fireBaseService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> leaguesCtrl');

      /**
       * checks url for url param for key value pair of admin=true
       */
      $scope.admin = $location.search().admin;

      /**
       * header for custom-table directive
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

        console.log('selectedLeagueIndex', selectedLeagueIndex);

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
      $scope.updateLeaguesData = function () {

        $updateDataUtils.updateLeagueTables()
          .then(httpDataLoaded);

      };

      /**
       * makes http request from thescore.ca API
       * @param httpData
       */
      $scope.httpDataLoaded = function (httpData) {

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

        $scope.setSelectedLeague();

        $scope.loading = false;

        // after http request start firebase so we can save later
        $scope.startFireBase(function () {
          console.log('HTTP --> FIREBASE READY');
          $scope.fireBaseReady = true;
          $scope.saveToFireBase();
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

        $scope.setSelectedLeague();

        console.log('syncDate:', firebaseData[dataKeyName]._lastSyncedOn);

        $scope.checkYesterday(firebaseData[dataKeyName]._lastSyncedOn);

      };

      /**
       * read data from local storage
       * @param localData
       */
      $scope.loadFromLocal = function (localData) {

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

        $scope.setSelectedLeague();

        console.log('syncDate:', localData._lastSyncedOn);

        $scope.checkYesterday(localData._lastSyncedOn);

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      var dataKeyName = 'leagueTables';

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
