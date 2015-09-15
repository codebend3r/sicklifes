/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('appCtrl', function ($scope, $rootScope, $fireBaseService, $momentService, $location, user) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('--> appCtrl');

      user.getCurrent().then(function (currentUser) {
        console.log('currentUser:', currentUser);
        $rootScope.user = user;
        //$scope.user = user;
      });

      /**
       * whether data is still loading
       */
      $scope.loading = true;

      /**
       * if firebase has been initalized
       */
      $scope.fireBaseReady = false;

      /**
       * if admin buttons will show
       * @type {boolean}
       */
      $scope.admin = $location.search().admin;

      /**
       * if manually adding players to roster
       * @type {boolean}
       */
      $scope.draftMode = $location.search().draftMode;

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
       * TODO
       * @type {{}}
       */
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
          firePromise.then(function (fbData) {
            console.log('firebase initialized');
            $scope.firebaseData = fbData;
            callback($scope.firebaseData);
          });
        }

      };

      /**
       * clears all players from every roster
       */
      $scope.resetAllPlayers = function () {

        _.each($rootScope.managersData, function (manager) {

          manager.players = {};
          manager.chlgCount = 0;
          manager.clGoals = 0;
          manager.domesticGoals = 0;
          manager.eGoals = 0;
          manager.eplCount = 0;
          manager.euroCount = 0;
          manager.filteredMonthlyGoalsLog = [];
          manager.ligaCount = 0;
          manager.monthlyGoalsLog = [];
          manager.seriCount = 0;
          manager.totalGoals = 0;
          manager.totalPoints = 0;
          manager.transactions = [];
          manager.wildCardCount = 0;

          //_.each(manager.players, function (eachPlayer) {
          //
          //});

        });

        console.log('>> $rootScope.managersData', $rootScope.managersData);

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
