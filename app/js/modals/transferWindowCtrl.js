/**
 * Created by Bouse on 11/22/2014.
 */

sicklifesFantasy.controller('transferWindowCtrl', function ($scope, $modalInstance, playerObject, $apiFactory) {

  //console.log('playerObject', playerObject);

  $scope.playerObject = playerObject;

  var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', $scope.playerObject.id);
  playerProfileRequest.then(function (d) {
    $scope.playerObject.playerImage = d.data.headshots.original;
  });

  $scope.ok = function () {
    $modalInstance.close($scope.playerObject);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

});