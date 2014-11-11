/**
 * Created by Bouse on 10/2/2014
 */

sicklifesFantasy.factory('$arrayLoopers', function ($textManipulator, localStorageService, $leagueTeams, $apiFactory, $scoringLogic) {

  var arrayLoopers = {

    resetScoreCount: function (manager, teamPlayers) {

      teamPlayers.goals = 0;
      teamPlayers.points = 0;
      teamPlayers.domesticGoals = 0;
      teamPlayers.leagueGoals = 0;
      teamPlayers.clGoals = 0;
      teamPlayers.eGoals = 0;

      manager.totalPoints = 0;
      manager.totalGoals = 0;
      manager.clGoals = 0;
      manager.eGoals = 0;
      manager.domesticGoals = 0;
      manager.testGoals = 0;
      manager.testPoints = 0;

    },

    /**
     *
     * @param $scope - controller $scope
     * @param manager - team which contains teamPlayers
     * @param teamPlayers - from loop
     */
    forEachPlayer: function ($scope, manager, teamPlayers) {

      arrayLoopers.resetScoreCount(manager, teamPlayers);

      var deferredList = deferredList || [];

      if (angular.isDefined(teamPlayers.league) && teamPlayers.id !== null) {

        var request = $apiFactory.getData({

          endPointURL: $textManipulator.getPlayerSummaryURL(teamPlayers.league, teamPlayers.id),

          qCallBack: function (result) {

            var league,
              gameGoals;

            result.data.map(function (i) {

              league = i.league.slug;
              gameGoals = i.games_goals;

              if ($textManipulator.acceptedLeague(league)) {

                teamPlayers.goals += gameGoals;
                manager.testGoals += gameGoals;
                manager.totalGoals += gameGoals;

                if ($textManipulator.isLeagueGoal(league)) {
                  teamPlayers.leagueGoals += gameGoals;
                }

                if ($textManipulator.isDomesticGoal(league)) {
                  teamPlayers.domesticGoals += gameGoals;
                  manager.domesticGoals += teamPlayers.domesticGoals;
                } else if ($textManipulator.isChampionsLeagueGoal(league)) {
                  teamPlayers.clGoals += gameGoals;
                  manager.clGoals += teamPlayers.clGoals;
                } else if ($textManipulator.isEuropaGoal(league)) {
                  teamPlayers.eGoals += gameGoals;
                  manager.eGoals += teamPlayers.eGoals;
                }

                //teamPlayers.points += gameGoals;
                teamPlayers.points += $scoringLogic.calculatePoints(gameGoals, league);
                manager.testPoints += $scoringLogic.calculatePoints(gameGoals, league);

                /*if (manager.managerName === 'Chester') {
                  console.log('--------------------------------------------');
                  console.log(teamPlayers.playerName);
                  console.log('scored', teamPlayers.points, 'points');
                }*/

              }

            });

            console.log('--------------------------------------------');
            console.log('managerName', manager.managerName);
            console.log('playerName', teamPlayers.playerName);

            manager.totalPoints += teamPlayers.points;
            console.log('teamPlayers.points', teamPlayers.points);
            console.log('manager.testPoints', manager.testPoints);
            console.log('manager.totalPoints', manager.totalPoints);
            console.log('manager.testGoals', manager.testGoals);
            console.log('manager.totalGoals', manager.totalGoals);              

          }
          
        });

      }

      deferredList.push(request.promise);

    },

    /**
     * TODO
     */
    getAllPlayers: function () {
      return [
        $leagueTeams.chester,
        $leagueTeams.frank,
        $leagueTeams.dan,
        $leagueTeams.justin,
        $leagueTeams.mike,
        $leagueTeams.joe
      ];
    },

    /**
     * TODO
     */
    getOwnerByID: function (id) {
      var owner = 'Free Agent';
      arrayLoopers.getAllPlayers().forEach(function (team) {
        team.players.some(function (p) {
          if (p.id === id) {
            owner = team.managerName;
            return p.id === id
          }
        });
      });
      return owner;
    }

  }

  return arrayLoopers;

});
