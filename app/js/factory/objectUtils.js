/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('objectUtils', function (momentService) {

      return {

        /**
         * resets goal and points count for a manager
         */
        cleanManager: function (m, cleanLogs) {

          cleanLogs = cleanLogs || false;

          m._lastSyncedOn = momentService.syncDate();

          m.seriCount = 0;
          m.ligaCount = 0;
          m.eplCount = 0;
          m.chlgCount = 0;
          m.euroCount = 0;
          m.wildCardCount = 0;

          m.totalGoals = 0;
          m.totalPoints = 0;
          m.domesticGoals = 0;
          m.clGoals = 0;
          m.eGoals = 0;
          m.chartData = [];
          m.gameDates = [];
          if (cleanLogs) {
            m.monthlyGoalsLog = [];
            m.filteredMonthlyGoalsLog = [];
          }
          return m;

        },

        /**
         *
         * @param p
         * @returns {*}
         */
        playerResetGoalPoints: function (p) {

          var cleanedPlayer = {};
          cleanedPlayer.player = {
            id: p.id,
            name: p.playerName
          };
          cleanedPlayer.league = {
            name: p.leagueName
          };
          cleanedPlayer.manager = {};
          cleanedPlayer.team = {
            id: p.teamId,
            logo: p.teamLogo,
            name: p.teamName
          };
          cleanedPlayer.stats = {};
          cleanedPlayer.stats.goals = 0;
          cleanedPlayer.stats.assists = 0;
          cleanedPlayer.stats.points = 0;
          cleanedPlayer.stats.domesticGoals = 0;
          cleanedPlayer.stats.clGoals = 0;
          cleanedPlayer.stats.eGoals = 0;

          return cleanedPlayer;

        },

        /**
         *
         * @param m
         */
        managerResetGoalPoints: function (m) {

          m.totalGoals = 0;
          m.totalPoints = 0;
          m.domesticGoals = 0;
          m.clGoals = 0;
          m.eGoals = 0;
          m.chartData = [];
          m.gameDates = [];
          return m;

        },

        /**
         * resets goal and points count for a player
         */
        cleanPlayer: function (p) {

          if (p) {
            p.goals = 0;
            p.assists = 0;
            p.points = 0;
            p.domesticGoals = 0;
            p.clGoals = 0;
            p.eGoals = 0;
            _.each(p.player, function(playerData, key) {
              p[key] = playerData;
            });
            delete p.player;
            return p;
          } else {
            return {};
          }

        }

      };

    });

})();
