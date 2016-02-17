/**
 * Created by Bouse on 12/30/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('latestGoalsCtrl', function ($scope, $rootScope, $timeout, momentService, managerData, gameLogs) {

      console.log('--> latestGoalsCtrl');

      /**
       * @name loadData
       * @description callback for when data is loaded
       */
      var loadData = function () {

        $rootScope.loading = false;

        $scope.managerData = managerData.data;

        _.each($scope.managerData, function(m, key) {

          m.filteredMonthlyGoalsLog = gameLogs.data[key].filteredMonthlyGoalsLog;
          m.monthlyGoalsLog = gameLogs.data[key].monthlyGoalsLog;

        });

        $rootScope.lastSyncDate = managerData._lastSyncedOn;
        $rootScope.source = 'firebase';

        if (momentService.isHoursAgo(managerData._lastSyncedOn)) {
          console.log('-- data is too old --');
        } else {
          console.log('-- data is up to date --');
        }

        $scope.combinedLogs = [];

        _.each($scope.managerData, function (manager) {
          $scope.combinedLogs = $scope.combinedLogs.concat(manager.filteredMonthlyGoalsLog
            .filter(function (log) {
              log.managerName = manager.managerName;
              return log.goals;
            }));
        });

        $rootScope.$emit('STANDINGS_READY');

        /////////////////////////////

      };

      loadData();


    });

})();
