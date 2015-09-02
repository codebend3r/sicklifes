/**
 * Created by Bouse on 09/01/2015
 */

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
       * select box changes function
       */
      $scope.changeLeague = function (league) {
        $state.go($state.current.name, {leagueName: league.className});
      };

      /**
       * TODO
       */
      $scope.selectedLeague = null;

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
       * sets the league
       */
      $scope.setSelectedLeague = function () {

        var selectedLeagueIndex = 0;

        _.some($scope.allLeagues, function (l, index) {
          if (l.className === $stateParams.leagueName) {
            console.log('match at', selectedLeagueIndex, $stateParams.leagueName);
            selectedLeagueIndex = index;
            return true;
          }
        });

        $scope.selectedLeague = $scope.allLeagues[selectedLeagueIndex];

        $scope.leagueName = $scope.selectedLeague.className;

        return $scope.allLeagues[selectedLeagueIndex];

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

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////


    });

})();
