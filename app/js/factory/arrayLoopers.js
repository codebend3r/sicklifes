/**
 * Created by Bouse on 10/2/2014
 */

sicklifesFantasy.factory('$arrayLoopers', function ($textManipulator, localStorageService, $leagueTeams, $apiFactory, $scoringLogic) {

  var arrayLoopers = {

    /**
     *
     * @param $scope - controller $scope
     * @param team - team which contains teamPlayers
     * @param saveToFireBase
     * @param teamPlayers - from loop
     */
    forEachPlayer: function ($scope, team, teamPlayers) {

      // teamPlayers is a child of team

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

      team.deferredList = team.deferredList || [];

      if (angular.isDefined(teamPlayers.league) && teamPlayers.id !== null) {

        var request = $apiFactory.getData({

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

      }

      team.deferredList.push(request.promise);

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
            owner = team.personName;
            return p.id === id
          }
        });
      });
      return owner;
    }

  }

  return arrayLoopers;

});
