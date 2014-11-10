/**
 * Created by Bouse on 10/2/2014
 */

sicklifesFantasy.factory('$arrayFilter', function ($date) {

  var arrayFilters = {

    /*
     * filters out any games after aug 1
     */
    filterAfterDate: function (game) {
      var gameDate = $date.create(game.box_score.event.game_date);
      return gameDate.isAfter('August 1 2014');
    },

    filterGoalsOnly: function (game) {
      return game.goals ? true : false;
    },

    isSelectedMonth: function (game) {
      var gameDate = game.rawDatePlayed || $date.create(game.box_score.event.game_date),
        scoredAGoal = game.goals ? true : false,
        isBetween = gameDate.isBetween($scope.selectedMonth.range[0], $scope.selectedMonth.range[1]);
      return isBetween && scoredAGoal;
    },

    filterOnMonth: function (manager, player, game) {
      var gameDate = $date.create(game.originalDate),
        scoredAGoal = game.goalsScored ? true : false,
        isBetween = gameDate.isBetween($scope.selectedMonth.range[0], $scope.selectedMonth.range[1]);

      if (isBetween && scoredAGoal) {
        manager.totalGoals += game.goalsScored;
        manager.totalPoints += game.points;
        return true;
      }
    }

  };

  return arrayFilters;

});
