/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.factory('$arrayMapper', function ($apiFactory, $textManipulator, $scoringLogic) {

  return {

    /**
     *
     * @param $scope - controller $scope
     * @param team - team which contains teamPlayers
     * @param teamPlayers - from loop
     */
    forEachPlayer: function ($scope, team, teamPlayers) {

      teamPlayers.goals = 0; // start at 0;
      teamPlayers.points = 0; // start at 0;
      teamPlayers.domesticGoals = 0;
      teamPlayers.leagueGoals = 0;
      teamPlayers.clGoals = 0;
      teamPlayers.eGoals = 0;

      team.totalPoints = 0;
      team.clGoals = 0;
      team.eGoals = 0;
      team.domesticGoals = 0;

      if (angular.isDefined(teamPlayers.league) && teamPlayers.id !== null) {

        $apiFactory.getData({

          endPointURL: $textManipulator.getPlayerSummaryURL(teamPlayers.league, teamPlayers.id),
          qCallBack: function (result) {

            result.data.map(function (i) {

              var league = i.league.slug,
                gameGoals = i.games_goals;

              if ($textManipulator.acceptedLeague(league)) {

                teamPlayers.goals += gameGoals;

                if ($textManipulator.isLeagueGoal(league)) {
                  teamPlayers.leagueGoals += gameGoals;
                }

                if ($textManipulator.isDomesticGoal(league)) {
                  teamPlayers.domesticGoals += gameGoals;
                } else if ($textManipulator.isChampionsLeagueGoal(league)) {
                  teamPlayers.clGoals += gameGoals;
                } else if ($textManipulator.isEuropaGoal(league)) {
                  teamPlayers.eGoals += gameGoals;
                }

                teamPlayers.points += $scoringLogic.calculatePoints(gameGoals, league);

              }

            });

            team.totalPoints += teamPlayers.points;
            team.clGoals += teamPlayers.clGoals;
            team.eGoals += teamPlayers.eGoals;
            team.domesticGoals += teamPlayers.domesticGoals;

          }
        });

      } else {

        //console.log('DEP: checking goals by all players');

        $scope.allPlayers.forEach(function (leaguePlayer) {

          //console.log(teamPlayers.playerName.toLowerCase(), '==', $textManipulator.stripVowelAccent(leaguePlayer.playerName.toLowerCase()));

          if (teamPlayers.playerName.toLowerCase() === $textManipulator.stripVowelAccent(leaguePlayer.playerName.toLowerCase())) {

            console.log('OLD MATCH', leaguePlayer.playerName, leaguePlayer.id);

            teamPlayers.goals += leaguePlayer.goals;
            teamPlayers.points = $scoringLogic.calculatePoints(teamPlayers.goals, leaguePlayer.league);
            team.totalPoints += teamPlayers.points;

          }

        });
      }

    }
  }

});