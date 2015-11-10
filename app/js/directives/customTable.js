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
          tableName: '@',
          tableParams: '=',
          sortFunction: '&',
          sortKey: '@'
        },
        controller: function ($scope) {

          $scope.ascending = false;

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
