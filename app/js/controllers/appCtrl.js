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
     */
    $scope.saveToFireBase = function () {

      if ($scope.fireBaseReady) {

        var saveObject = {
          _syncedFrom: 'leaguesCtrl',
          _lastSyncedOn: $momentService.syncDate(),
          LIGA: $scope.allLeagues[0].source,
          EPL: $scope.allLeagues[1].source,
          SERI: $scope.allLeagues[2].source,
          CHLG: $scope.allLeagues[3].source,
          UEFA: $scope.allLeagues[4].source
        };

        $fireBaseService.saveToFireBase(saveObject, $scope.dataKeyName);

      } else {

        $scope.startFireBase();

      }

    };

    /**
     * starts the process of getting data from firebase
     * @param callback
     */
    $scope.startFireBase = function (callback) {
      $scope.startFireBase();
      if ($scope.fireBaseReady) {
        callback();
      } else {
        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(callback);
      }

    };

    /**
     * check to see if date is yesterday
     */
    $scope.checkYesterday = function (syncDate) {

      if ($momentService.isPastYesterday(syncDate)) {
        console.log('IS YESTERDAY');
        $scope.loading = false;
        //$scope.updateLeaguesData();
        return true;
      } else {
        console.log('NOT YESTERDAY YET');
        $scope.loading = false;
        // no matter if it's yesterday or not, start firebase so we can save later
        //$scope.startFireBase(function () {
        //  $scope.fireBaseReady = true;
        //  $scope.saveToFireBase();
        //});
        return false;
      }

    };


  });
