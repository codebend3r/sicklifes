/**
 * Created by Bouse on 11/22/2014.
 */

sicklifesFantasy.controller('transferWindowCtrl', function ($scope, $modalInstance, playerObject) {

  console.log('playerObject', playerObject);

  $scope.playerObject = playerObject;

  $scope.ok = function () {
    $modalInstance.close($scope.playerObject);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

});