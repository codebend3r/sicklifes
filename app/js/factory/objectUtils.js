/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.factory('$objectUtils', function () {

  var objectUtils = {

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

      p.dateOfTransaction = $dateService.transactionDate();
      p.goals = 0;
      p.points = 0;
      p.domesticGoals = 0;
      p.clGoals = 0;
      p.eGoals = 0;
      return p;

    }

  }

  return objectUtils;

})
;
