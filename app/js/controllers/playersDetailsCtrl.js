/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMapper) {

  'use strict';

  $scope.loading = true;

  $scope.player = {};

  $scope.init = function () {

    var id = $routeParams.playerID;

    var league = 'liga';

    var playerDetailsRequest = $apiFactory.getPlayerDetails(league, id);

    playerDetailsRequest.promise.then(function (result) {

      console.log('result player details', result);

    });

  };

  $scope.init();

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };


});