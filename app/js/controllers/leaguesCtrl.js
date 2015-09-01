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
        //console.log('> leagueName', league);
        //$state.go('tables', {leagueName: league.className});
      };

      /**
       * TODO
       */
      $scope.selectedLeague = null;

      /**
       * TODO
       */
      $scope.allLeagues = [];

      /**
       * sets the league
       */
      $scope.setSelectedLeague = function (allLeagues) {

        var selectedLeagueIndex = 0;

        _.some(allLeagues, function (l, index) {
          if (l.className === $stateParams.leagueName) {
            console.log('match at', selectedLeagueIndex, $stateParams.leagueName);
            selectedLeagueIndex = index;
            return true;
          }
        });

        $scope.selectedLeague = allLeagues[selectedLeagueIndex];

        $scope.leagueName = $scope.selectedLeague.className;

        return allLeagues[selectedLeagueIndex];

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
