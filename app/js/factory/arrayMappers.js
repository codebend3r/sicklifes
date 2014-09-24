/**
 * Created by crivas on 9/12/2014.
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

      team.totalPoints = 0; // start at 0;

      if (angular.isDefined(teamPlayers.league) && teamPlayers.id !== null) {
	  
        $apiFactory.getData({
          endPointURL: $textManipulator.getPlayerURL(teamPlayers.league, teamPlayers.id),
          qCallBack: function (result) {

            result.data.map(function (i) {

              if ($textManipulator.acceptedLeague(i.league.api_uri)) {

                teamPlayers.goals += i.games_goals;

                if ($textManipulator.isLeagueGoal(i.league.api_uri)) {
                  teamPlayers.leagueGoals += i.games_goals
                }

                if ($textManipulator.isDomesticGoal(i.league.api_uri)) {
                  teamPlayers.domesticGoals += i.games_goals;
                } else if ($textManipulator.isChampionsLeagueGoal(i.league.api_uri)) {
                  teamPlayers.clGoals += i.games_goals;
                } else if ($textManipulator.isEuropaGoal(i.league.api_uri)) {
                  teamPlayers.eGoals += i.games_goals;
                }
                teamPlayers.points = $scoringLogic.calculatePoints(teamPlayers.goals, i.league.api_uri);

              }

            });
			
            team.totalPoints += teamPlayers.points;

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