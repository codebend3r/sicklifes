/**
 * Created by Bouse on 10/2/2014
 */

sicklifesFantasy.factory('$arrayLoopers', function ($textManipulator, $objectUtils, localStorageService, $managersService, $apiFactory, $scoringLogic) {

  var arrayLoopers = {

    /**
     * loops through all players and fetches goals and calculates points
     * @param $scope - controller $scope
     * @param manager - manager which contains players
     * @param players - from loop
     */
    forEachPlayer: function ($scope, manager, players) {

      arrayLoopers.resetScoreCount(manager, players);

      players = objectUtils.playerResetGoalPoints(players)
      manager = objectUtils.managerResetGoalPoints(manager)

      var deferredList = deferredList || [];

      if (angular.isDefined(players.league) && players.id !== null) {

        var request = $apiFactory.getData({

          endPointURL: $textManipulator.getPlayerSummaryURL(players.league, players.id),

          qCallBack: function (result) {

            var league,
              gameGoals;

            result.data.map(function (i) {

              league = i.league.slug;
              gameGoals = i.games_goals;

              if ($textManipulator.acceptedLeague(league)) {

                players.goals += gameGoals;
                manager.totalGoals += gameGoals;

                if ($textManipulator.isLeagueGoal(league)) {
                  players.leagueGoals += gameGoals;
                }

                if ($textManipulator.isDomesticGoal(league)) {
                  players.domesticGoals += gameGoals;
                  manager.domesticGoals += players.domesticGoals;
                } else if ($textManipulator.isChampionsLeagueGoal(league)) {
                  players.clGoals += gameGoals;
                  manager.clGoals += players.clGoals;
                } else if ($textManipulator.isEuropaGoal(league)) {
                  players.eGoals += gameGoals;
                  manager.eGoals += players.eGoals;
                }

                players.points += $scoringLogic.calculatePoints(gameGoals, league, players);

              }

            });

            manager.totalPoints += players.points;

            /*console.log('--------------------------------------------');
             console.log('managerName', manager.managerName);
             console.log('playerName', players.playerName);
             console.log('players.points', players.points);
             console.log('manager.testPoints', manager.testPoints);
             console.log('manager.totalPoints', manager.totalPoints);
             console.log('manager.testGoals', manager.testGoals);
             console.log('manager.totalGoals', manager.totalGoals);*/

          }

        });

      }

      deferredList.push(request.promise);

    },

    /**
     * TODO
     */
    getOwnerByID: function (id) {
      var owner = 'Free Agent';
      $managersService.getAllPlayers().forEach(function (team) {
        team.players.some(function (p) {
          if (p.id === id) {
            owner = team.managerName;
            return p.id === id
          }
        });
      });
      return owner;
    }

  };

  return arrayLoopers;

});
