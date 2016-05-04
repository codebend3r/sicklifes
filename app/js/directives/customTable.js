/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('customTable', function ($moment) {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: function ($element, $attrs) {
          return 'views/directives/tables/table-' + $attrs.tableBodyTemplate + '.html';
        },
        scope: {
          list: '=',
          tableName: '@',
          tableParams: '=',
          sortFunction: '&',
          sortKey: '@'
        },
        controller: function ($scope) {

          $scope.edit = $scope.$root.edit;

          $scope.ascending = false;

          // var transferShown = false;

          $scope.isValidGame = function (player, game) {
            var gameDate = $moment(new Date(game.datePlayed).toISOString());
            if (player.status === 'added' && gameDate.isAfter(new Date(player.dateOfTransaction).toISOString())) {
              return true;
            } else if (player.status === 'dropped' && gameDate.isBefore(new Date(player.dateOfTransaction).toISOString())) {
              return true;
            } else if (player.status === 'drafted') {
              return true;
            } else {
              return true;
            }

          };

          $scope.setSortKey = function (key) {
            if ($scope.sortKey === key) {
              $scope.ascending = !$scope.ascending;
            } else {
              $scope.sortKey = key;
            }
          };

          $scope.playerSearch = {
            playerQuery: '',
            teamQuery: ''
          };

        }
      };

    });

})();
