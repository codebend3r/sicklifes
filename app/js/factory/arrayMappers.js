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

      team.totalPoints = 0;
      team.clGoals = 0;
      team.eGoals = 0;
      team.domesticGoals = 0;

      if (angular.isDefined(teamPlayers.league) && teamPlayers.id !== null) {

        $apiFactory.getData({
          endPointURL: $textManipulator.getPlayerURL(teamPlayers.league, teamPlayers.id),
          qCallBack: function (result) {

            //console.log('result.data', result.data);

            result.data.map(function (i) {

              var league = i.box_score.event.league.slug;

              //var date = new Date(i.box_score.event.game_date);
              //console.log(date);

              if ($textManipulator.acceptedLeague(league)) {

                console.log('goals', i.goals, 'on', i.box_score.event.game_date);

                teamPlayers.goals += i.goals;

                if ($textManipulator.isLeagueGoal(league)) {
                  teamPlayers.leagueGoals += i.goals
                }

                if ($textManipulator.isDomesticGoal(league)) {
                  teamPlayers.domesticGoals += i.goals;
                } else if ($textManipulator.isChampionsLeagueGoal(league)) {
                  teamPlayers.clGoals += i.goals;
                } else if ($textManipulator.isEuropaGoal(league)) {
                  teamPlayers.eGoals += i.goals;
                }

                teamPlayers.points += $scoringLogic.calculatePoints(i.goals, league);

              }

            });

            console.log('================================================');

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
