/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('appCtrl', function ($scope, $rootScope, $fireBaseService, $momentService, user) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> appCtrl');

      user.getCurrent().then(function(currentUser) {
        //console.log('currentUser:', currentUser);
        $rootScope.user = user;
        $scope.user = user;
      });

      /**
       * whether data is still loading
       */
      $rootScope.loading = true;

      /**
       * if firebase has been initalized
       */
      $rootScope.fireBaseReady = false;

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

      $scope.firebaseData = {};

      /**
       * starts the process of getting data from firebase
       * @param callback
       */
      $scope.startFireBase = function (callback) {
        if ($rootScope.fireBaseReady) {
          console.log('firebase already started, returning now');
          callback($scope.firebaseData);
        } else {
          $fireBaseService.initialize($scope);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.then(function(fbData) {
            console.log('firebase initialized');
            $scope.firebaseData = fbData;
            callback($scope.firebaseData);
          });
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
