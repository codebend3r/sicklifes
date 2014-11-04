/**
 * Created by Bouse on 9/18/2014.
 */

sicklifesFantasy.directive('playerDetailsTable', function () {

  return {
    restrict: 'E',
    replace: false,
    //templateUrl: 'views/directives/player-details-table.html',
    templateUrl: function ($element, $attrs) {
      return 'views/directives/tables/table-' + $attrs.tableBodyTemplate + '.html';
    },
    scope: {
      gameDetails: '=',
      tableHeader: '=',
      leagueName: '@'
    }
  }

});

