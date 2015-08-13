/**
 * Created by Bouse on 10/2/2014
 */

angular.module('sicklifes')

  .factory('$arrayFilter', function ($momentService, $scoringLogic) {

    var arrayFilters = {};

    /**
     * the date the league starts capturing data
     * @returns {string}
     */
    arrayFilters.leagueStartDate = 'August 1 2015';

    /**
     * filters out any games after aug 1
     * @returns {boolean}
     */
    arrayFilters.filterAfterDate = function (game) {
      var gameDate = $momentService.getDate(game.box_score.event.game_date);
      return gameDate.isAfter(arrayFilters.leagueStartDate);
    };

    /**
     * filters out any games after from players added or dropped aug 1
     * @returns {boolean}
     */
    arrayFilters.filterValidDate = function (player, game) {
      var gameDate = $momentService.getDate(game.box_score.event.game_date);
      if (player.status === 'added') {
        return gameDate.isAfter(player.dateOfTransaction);
      } else if (player.status === 'dropped') {
        return gameDate.isBefore(player.dateOfTransaction);
      } else {
        return gameDate.isAfter(arrayFilters.leagueStartDate);
      }
    };

    /**
     * filters out games with goals
     * @returns {boolean}
     */
    arrayFilters.filterOnValidGoals = function (player, game) {
      if (game.goals) {
        var gameDate = $momentService.getDate(game.box_score.event.game_date);
        if (player.status === 'added') {
          return gameDate.isAfter(player.dateOfTransaction);
        } else if (player.status === 'dropped') {
          return gameDate.isBefore(player.dateOfTransaction);
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    /**
     *
     * @param selectedMonth
     * @param game
     * @returns {boolean}
     */
    arrayFilters.isSelectedMonth = function (selectedMonth, game) {
      var gameDate = game.rawDatePlayed || $momentService.getDate(game.box_score.event.game_date),
        scoredAGoal = game.goals ? true : false,
        isBetween = gameDate.isBetween(selectedMonth.range[0], selectedMonth.range[1]);
      return isBetween && scoredAGoal;
    };

    /**
     * filters on specific month and if 1 or more goals
     * @param manager
     * @param selectedMonth
     * @param player
     * @param game
     * @returns {boolean}
     */
    arrayFilters.filterOnMonth = function (manager, selectedMonth, player, game) {

      var gameDate = $momentService.getDate(game.originalDate),
        scoredAGoal = game.goalsScored ? true : false,
        isBetween = gameDate.isBetween(selectedMonth.range[0], selectedMonth.range[1]);

      if (isBetween && scoredAGoal) {
        manager.totalGoals += game.goalsScored;
        manager.totalPoints += $scoringLogic.calculatePoints(game.goalsScored, game.leagueSlug);
        return true;
      }
    };

    return arrayFilters;

  });
