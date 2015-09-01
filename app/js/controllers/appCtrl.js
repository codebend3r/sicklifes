/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('appCtrl', function ($scope, $rootScope, $fireBaseService, $momentService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> appCtrl');

      /**
       * whether data is still loading
       */
      $scope.loading = false;

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
       * @param dataKey
       */
      $scope.saveToFireBase = function (saveObject, dataKey) {

        if ($rootScope.fireBaseReady) {

          $fireBaseService.saveToFireBase(saveObject, dataKey);

        } else {

          $scope.startFireBase();

        }

      };

      /**
       * starts the process of getting data from firebase
       * @param callback
       */
      $scope.startFireBase = function (callback) {
        if ($rootScope.fireBaseReady) {
          callback();
        } else {
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

})();
