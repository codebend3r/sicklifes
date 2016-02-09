/**
 * Created by Bouse on 02/09/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leaguesCtrl', function ($scope, $rootScope, $stateParams, $state, $localStorage, $location, $http, updateDataUtils, momentService, textManipulator, leagueTables, apiFactory) {

      console.log('--> leaguesCtrl');

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $scope.totalItems = 10;
      $scope.currentPage = 1;

      $scope.pageChanged = function () {
        console.log('Page changed to: ' + $scope.currentPage);
      };


      /**
       * select box changes function
       */
      $scope.changeLeague = function (league) {
        $state.go($state.current.name, {leagueName: league.slug});
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
          name: textManipulator.leagueLongNames.liga,
          source: null,
          slug: 'liga',
          img: textManipulator.leagueImages.liga
        },
        {
          name: textManipulator.leagueLongNames.epl,
          source: null,
          slug: 'epl',
          img: textManipulator.leagueImages.epl
        },
        {
          name: textManipulator.leagueLongNames.seri,
          source: null,
          slug: 'seri',
          img: textManipulator.leagueImages.seri
        },
        {
          name: textManipulator.leagueLongNames.chlg,
          source: null,
          slug: 'chlg',
          img: textManipulator.leagueImages.chlg
        },
        {
          name: textManipulator.leagueLongNames.euro,
          source: null,
          slug: 'uefa',
          img: textManipulator.leagueImages.euro
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


    });

})();
