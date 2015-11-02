/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leaguesCtrl', function ($scope, $stateParams, $state, $apiFactory, $localStorage, $location, $http, $updateDataUtils, $momentService, $rootScope, $textManipulator, $fireBaseService, imageTool) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> leaguesCtrl');

      $scope.totalItems = 10;
      $scope.currentPage = 1;

      $scope.pageChanged = function () {
        console.log('Page changed to: ' + $scope.currentPage);
      };


      /**
       * select box changes function
       */
      $scope.changeLeague = function (league) {
        $state.go($state.current.name, { leagueName: league.slug });
      };

      /**
       * object of current league in the url as a stateParams
       */
      $scope.selectedLeague = null;

      /**
       * all leagues array
       */
      $scope.allLeagues = [
        {
          name: $textManipulator.leagueLongNames.liga,
          source: null,
          slug: 'liga',
          img: $textManipulator.leagueImages.liga
        },
        {
          name: $textManipulator.leagueLongNames.epl,
          source: null,
          slug: 'epl',
          img: $textManipulator.leagueImages.epl
        },
        {
          name: $textManipulator.leagueLongNames.seri,
          source: null,
          slug: 'seri',
          img: $textManipulator.leagueImages.seri
        },
        {
          name: $textManipulator.leagueLongNames.chlg,
          source: null,
          slug: 'chlg',
          img: $textManipulator.leagueImages.chlg
        },
        {
          name: $textManipulator.leagueLongNames.euro,
          source: null,
          slug: 'uefa',
          img: $textManipulator.leagueImages.euro
        }
      ];

      /**
       * sets the league
       */
      $scope.setSelectedLeague = function () {

        var selectedLeagueIndex = 0;

        _.some($scope.allLeagues, function (l, index) {
          if (l.slug === $stateParams.leagueName) {
            selectedLeagueIndex = index;
            return true;
          }
        });

        $scope.selectedLeague = $scope.allLeagues[selectedLeagueIndex];

        $scope.leagueName = $scope.selectedLeague.slug;

        return $scope.allLeagues[selectedLeagueIndex];

      };

      /**
       * tabs data
       */
      $scope.tabData = [
        {
          title: 'Tables',
          route: 'leagues.tables',
          active: true
        },
        {
          title: 'Leaders',
          route: 'leagues.leaders',
          active: false
        }
      ];

      /**
       * make http request for current league leader in goals
       * @param callback
       */
      $scope.updateLeadersFromHTTP = function (callback) {

        console.log('leaguesCtrl --> updateLeadersFromHTTP');

        $http({
          url: 'http://api.thescore.com/' + $stateParams.leagueName + '/leaders?categories=Goals&season_type=regular',
          method: 'GET'
        }).then(callback);

      };

      /**
       * get data through HTTP request
       * @param callback
       */
      $scope.updateTablesFromHTTP = function (callback) {

        console.log('leaguesCtrl --> updateTablesFromHTTP');

        $updateDataUtils.updateLeagueTables()
          .then(callback);

      };


    });

})();
