/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$objectUtils', function ($momentService) {

      return {

        /**
         * resets goal and points count for a manager
         */
        cleanManager: function (m, cleanLogs) {

          cleanLogs = cleanLogs || false;

          m.totalGoals = 0;
          m.totalPoints = 0;
          m.domesticGoals = 0;
          m.clGoals = 0;
          m.eGoals = 0;
          if (cleanLogs) {
            m.monthlyGoalsLog = [];
            m.filteredMonthlyGoalsLog = [];
          }
          return m;

        },

        playerResetGoalPoints: function (p) {

          p.goals = 0;
          p.points = 0;
          p.domesticGoals = 0;
          p.clGoals = 0;
          p.eGoals = 0;
          return p;

        },

        managerResetGoalPoints: function (m) {

          m.totalGoals = 0;
          m.totalPoints = 0;
          m.domesticGoals = 0;
          m.clGoals = 0;
          m.eGoals = 0;
          return m;

        },

        /**
         * resets goal and points count for a player
         */
        cleanPlayer: function (p) {

          if (p) {
            p.dateOfTransaction = $momentService.transactionDate();
            p.goals = 0;
            p.points = 0;
            p.domesticGoals = 0;
            p.clGoals = 0;
            p.eGoals = 0;
            return p;
          } else {
            return {};
          }

        }

      };

    });

})();