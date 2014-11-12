/**
 * Created by Bouse on 9/18/2014.
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

      //console.log('list', $scope.list);
      //console.log('addPlayer', $scope.addPlayer);
      //console.log('dropPlayer', $scope.dropPlayer);
      //console.log('tableHeader', $scope.tableHeader);
      //console.log('tableName', $scope.tableName);
      //console.log('leagueImg', $scope.leagueImg);

    }
  }

});

