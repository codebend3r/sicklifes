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
          addPlayer: '&',
          dropPlayer: '&',
          tableName: '@',
          //playerSearch: '@',
          leagueImg: '='
        },
        controller: function ($scope) {

          $scope.playerSearch = {
            playerQuery: '',
            teamQuery: ''
          };

        }
      };

    });

})();
