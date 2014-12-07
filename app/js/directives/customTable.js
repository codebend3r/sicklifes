/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.directive('customTable', function () {

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
      leagueImg: '='
    },
    link: function ($scope) {

      $scope.playerSearch = '';
      
    }
  }

});

