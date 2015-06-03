/**
 * Created by Bouse on 10/2/2014
 */

angular.module('sicklifes')

  .factory('$arrayFilter', function ($date, $scoringLogic) {

    var arrayFilters = {

      /**
       * filters out any games after aug 1
       * @returns {boolean}
       */
      filterAfterDate: function (game) {
        var gameDate = $date.create(game.box_score.event.game_date);
        //console.log('gameDate', gameDate);
        return gameDate.isAfter('August 1 2014');
        //return false;
      },

      /**
       * filters out any games after from players added or dropped aug 1
       * @returns {boolean}
       */
      filterValidDate: function (player, game) {
        var gameDate = $date.create(game.box_score.event.game_date);
        if (player.status === 'added') {
          return gameDate.isAfter(player.dateOfTransaction);
        } else if (player.status === 'dropped') {
          return gameDate.isBefore(player.dateOfTransaction);
        } else {
          return gameDate.isAfter('August 1 2014');
        }
      },

      /**
       * filters out games with goals
       * @returns {boolean}
       */
      filterOnValidGoals: function (player, game) {
        if (game.goals) {
          var gameDate = $date.create(game.box_score.event.game_date);
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
      },

      /**
       *
       * @param selectedMonth
       * @param game
       * @returns {boolean}
       */
      isSelectedMonth: function (selectedMonth, game) {
        var gameDate = game.rawDatePlayed || $date.create(game.box_score.event.game_date),
          scoredAGoal = game.goals ? true : false,
          isBetween = gameDate.isBetween(selectedMonth.range[0], selectedMonth.range[1]);
        return isBetween && scoredAGoal;
      },

      /**
       *
       * @param manager
       * @param selectedMonth
       * @param player
       * @param game
       * @returns {boolean}
       */
      filterOnMonth: function (manager, selectedMonth, player, game) {

        var gameDate = $date.create(game.originalDate),
          scoredAGoal = game.goalsScored ? true : false,
          isBetween = gameDate.isBetween(selectedMonth.range[0], selectedMonth.range[1]);

        if (isBetween && scoredAGoal) {
          manager.totalGoals += game.goalsScored;
          manager.totalPoints += $scoringLogic.calculatePoints(game.goalsScored, game.leagueSlug);
          return true;
        }
      }

    };

    return arrayFilters;

  });
