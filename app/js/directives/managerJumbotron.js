/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.directive('managerJumbotron', function () {

  return {
    restrict: 'E',
    replace: false,
    templateUrl: 'views/directives/manager-jumbotron.html',
    scope: {
      manager: '=',
      selectedMonth: '='
    }
  };

});
