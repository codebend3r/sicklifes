/**
 * Created by Bouse on 9/18/2014.
 */

sicklifesFantasy.directive('playerDetailsTable', function () {

  return {
    restrict: 'E',
    replace: false,
    templateUrl: 'views/directives/player-details-table.html',
    scope: {
      gameDetails: '=',
      tableHeader: '=',
      leagueName: '@'
    }
  }

});

