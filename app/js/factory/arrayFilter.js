/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('arrayFilter', function (momentService) {

      var arrayFilter = {};

      /**
       * @description the date the league starts capturing data
       * @returns {string}
       */
      arrayFilter.leagueStartDate = 'August 1 2015';

      /**
       * @description filters out any games after aug 1
       * @returns {boolean}
       */
      arrayFilter.filterAfterDate = function (game) {
        var gameDate = moment(new Date(game.datePlayed).toISOString());
        return gameDate.isAfter(arrayFilter.leagueStartDate);
      };

      /**
       * @description filters out any games after from players added or dropped aug 1
       * @returns {boolean}
       */
      arrayFilter.filterOnValidGoals = function (player, game) {
        var gameDate = moment(new Date(game.datePlayed).toISOString());
        if (player.status === 'added') {
         return gameDate.isAfter(player.dateOfTransaction);
        } else if (player.status === 'dropped') {
         return gameDate.isBefore(player.dateOfTransaction);
        } else {
         return gameDate.isAfter(arrayFilter.leagueStartDate);
        }
      };

      /**
       * @description
       * @param selectedMonth
       * @param game
       * @returns {boolean}
       */
      arrayFilter.isSelectedMonth = function (selectedMonth, game) {
        var gameDate = moment(game.rawDatePlayed.toISOString()) || moment(new Date(game.box_score.event.game_date).toISOString());
        var scoredAGoal = game.goals ? true : false;
        var start = moment(new Date(selectedMonth.range[0]).toISOString());
        var end = moment(new Date(selectedMonth.range[1]).toISOString());
        var isBetween = gameDate.isBetween(start, end);
        return isBetween && scoredAGoal;
      };

      /**
       * @description filters on specific month and if 1 or more goals
       * @param selectedMonth
       * @param game
       * @returns {boolean}
       */
      arrayFilter.filterOnMonth = function (selectedMonth, game) {
        var gameDate = moment(new Date(game.originalDate).toISOString()); // momentService.getDate(game.originalDate),
        var start = moment(new Date(selectedMonth.range[0]).toISOString());
        var end = moment(new Date(selectedMonth.range[1]).toISOString());
        var isBetween = gameDate.isBetween(start, end);
        return isBetween;
      };

      arrayFilter.filterOutUndefined = function(data) {
        return !angular.isUndefinedOrNull(data);
      };

      return arrayFilter;

    });

})();
