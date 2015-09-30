/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('customTable', function () {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: function ($element, $attrs) {
          return 'views/directives/tables/table-' + $attrs.tableBodyTemplate + '.html';
        },
        scope: {
          list: '=',
          tableHeader: '=',
          tableName: '@',
          tableParams: '=',
          sortFunction: '&',
          sortKey: '@',
          leagueImg: '='
        },
        controller: function ($scope) {

          $scope.ascending = false;
          
          $scope.setSortKey = function(key) {
            if ($scope.sortKey === key) {
              $scope.ascending = !$scope.ascending;
            } else {
              $scope.sortKey = key;
            }
          };

          $scope.everyFourth = function(index) {
            return index % 4 === 0;
          };

          $scope.playerSearch = {
            playerQuery: '',
            teamQuery: ''
          };

        }
      };

    });

})();
