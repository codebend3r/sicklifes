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
        //console.log('currentUser:', currentUser);
        $rootScope.user = currentUser;
        //$scope.user = user;
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
       * populates $rootScope.managersData
       * @param data {object}
       */
      $scope.populateManagersData = function (data) {

        var managerData = {
          chester: data.chester,
          frank: data.frank,
          dan: data.dan,
          justin: data.justin,
          mike: data.mike,
          joe: data.joe
        };

        $scope.managersData = managerData;
        $rootScope.managersData = managerData;

        return managerData;

      };

      /**
       * defines $scope.selectedManager
       */
      $scope.chooseManager = function (managerId) {

        console.log('> $scope.managersData:', $scope.managersData);
        $scope.selectedManager = $scope.managersData[managerId.toLowerCase()];
        console.log('selected managerName:', $scope.selectedManager.managerName);

      };

      /**
       * sets data in the initialized firebase service
       * @param saveObject
       * @param dataKey
       */
      $scope.saveToFireBase = function (saveObject, dataKey) {
        if ($rootScope.fireBaseReady) {
          $fireBaseService.saveToFireBase(saveObject, dataKey);
        } else {
          $scope.startFireBase($scope.saveToFireBase);
        }
      };

      /**
       * starts the process of getting data from firebase
       * @param callback
       */
      $scope.startFireBase = function (callback) {
        if (angular.isUndefinedOrNull(callback)) throw new Error('$scope.startFireBase: the callback parameter was not defined');
        if ($rootScope.fireBaseReady) {
          console.log('firebase already started, returning now');
          callback($scope.firebaseData);
        } else {
          $fireBaseService.initialize($scope);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.then(function (fbData) {
            console.log('firebase initialized', fbData);
            callback(fbData);
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
