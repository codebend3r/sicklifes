/**
 * Created by Bouse on 9/18/2014.
 */

sicklifesFantasy.directive('playerDetailsTable', function ($location) {

  return {
    restrict: 'E',
    replace: false,
    scope: {
      gameDetails: '=',
      tableHeader: '=',
      leagueName: '='
    },
    templateURL: 'views/directives/player-details-table.html'
  }

});
