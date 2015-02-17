/**
 * Updated by Bouse on 12/23/2014
 */

sicklifesFantasy.factory('$updateDataUtils', function ($apiFactory, $objectUtils, $textManipulator, $arrayMappers) {

  var updateDataUtils = {

    /**
     * gets data from all of the players in all valid leagues
     */
    updatePlayerPoolData: function (allManagers, allPlayers, callback) {

      console.log('UPDATING PLAYER POOL...');

      var allTeams = $apiFactory.getAllTeams();

      allPlayers = [];

      var count = 0;

      // returns a list of promise with the end point for each league
      $apiFactory.listOfPromises(allTeams, function (result) {

        result.forEach(function (leagueData) {

          leagueData.data.forEach(function (teamData) {

            console.log('LEAGUE:', leagueData.leagueName, ', TEAM:', teamData.full_name);

            // returns a promise with the end point for each team
            var rosterRequest = $apiFactory.getData({
              endPointURL: $textManipulator.getTeamRosterURL(leagueData.leagueName, teamData.id)
            });

            rosterRequest.then(function (playerData) {

              count += 1;

              // each player on each team
              var rosterArray = playerData.data.map($arrayMappers.transferPlayersMap.bind(this, allManagers, leagueData, teamData));
              allPlayers = allPlayers.concat(rosterArray);

              if (count >= 140) {
                console.log('ALL PLAYERS UPDATED');
                callback(allPlayers);
              }

            });

          });

        });


      });

    },

    /**
     * gets data from all of the players in all valid leagues
     */
    updateAllManagerData: function (allManagers) {

      console.log('UPDATING ALL MANAGERS...');

      var allLeaguePromises = [];

      allManagers.forEach(function (manager) {

        // reset goal counts
        manager = $objectUtils.cleanManager(manager, true);

        manager.players.forEach(function (player) {

          player = $objectUtils.playerResetGoalPoints(player);

          manager.seriCount = 0;
          manager.ligaCount = 0;
          manager.eplCount = 0;
          manager.wildCardCount = 0;

          var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', player.id);

          allLeaguePromises.push(playerProfileRequest);

          playerProfileRequest
            .then($arrayMappers.playerInfo.bind(this, player))
            .then($arrayMappers.playerGamesLog.bind(this, { player: player, manager: manager }));
          //playerProfileRequest.then($arrayMappers.playerGamesLog.bind(this, { player: player, manager: manager }));

        });

      });

      $apiFactory.listOfPromises(allLeaguePromises, function (result) {
        console.log('updateAllManagerData - ALL DATA LOADED');
      });

    },

    updateLeaguesData: function (allManagers, callback) {

      console.log('UPDATING ALL LEAGUES');

      var allLeagues = [],
      // list of all goal scorers in all leagues
        consolidatedGoalScorers = [],
      // makes a request for all leagues in a loop returns a list of promises
        allPromises = $apiFactory.getAllGoalLeaders();

      // waits for an array of promises to resolve, sets allLeagues data
      $apiFactory.listOfPromises(allPromises, function (result) {

        allLeagues = [];

        result.forEach(function (league) {
          var goalsMap = league.data.goals.map($arrayMappers.goalsMap.bind($arrayMappers, allManagers, league.leagueURL));
          allLeagues.push({
            name: $textManipulator.properLeagueName(league.leagueName),
            source: goalsMap,
            className: league.leagueName,
            img: $textManipulator.leagueImages[league.leagueName]
          });
          consolidatedGoalScorers = consolidatedGoalScorers.concat(goalsMap);
        });

        console.log('ALL LEAGUES COMPLETE', allLeagues);
        callback(allLeagues);

      });

    }

  };

  return updateDataUtils;

});
