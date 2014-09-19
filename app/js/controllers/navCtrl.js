/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('navCtrl', function ($scope, $location) {

  'use strict';

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

});