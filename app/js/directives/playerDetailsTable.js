/**
 * Created by Bouse on 9/18/2014.
 */

sicklifesFantasy.directive('playerDetailsTable', function () {

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
      leagueImg: '='
    },
    link: function ($scope) {

      $scope.playerSearch = '';

      //console.log('list', $scope.list);
      //console.log('tableHeader', $scope.tableHeader);
      //console.log('tableName', $scope.tableName);
      //console.log('leagueImg', $scope.leagueImg);

    }
  }

});

