/**
 * Created by Bouse on 12/23/2014
 */

angular.module('sicklifes')

  .controller('appCtrl', function ($scope, $fireBaseService, $momentService) {

    console.log('--> appCtrl');

    /**
     * whether data is still loading
     */
    $scope.loading = true;

    /**
     * if firebase has been initalized
     */
    $scope.fireBaseReady = false;

    /**
     * key name
     */
    $scope.dataKeyName = '';

    /**
     * sets data in the initialized firebase service
     * @param saveObject
     * @param ctrlName
     * @param dataKey
     */
    $scope.saveToFireBase = function (saveObject, dataKey) {

      if ($scope.fireBaseReady) {

        console.log('...SAVING TO FIREBASE');
        $fireBaseService.saveToFireBase(saveObject, dataKey);

      } else {

        console.log('...FIREBSE NOT READY, START FIREBASE NOW');
        $scope.startFireBase();

      }

    };

    /**
     * starts the process of getting data from firebase
     * @param callback
     */
    $scope.startFireBase = function (callback) {
      if ($scope.fireBaseReady) {
        console.log('return immediately');
        callback();
      } else {
        console.log('initialzing firebase');
        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(callback);
      }

    };

    /**
     * check to see if date is yesterday
     * @param syncDate
     */
    $scope.checkYesterday = function (syncDate) {

      return $momentService.isPastYesterday(syncDate);

    };


  });
