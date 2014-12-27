/**
 * Updated by Bouse on 12/23/2014
 */

sicklifesFantasy.factory('$updateDataUtils', function ($apiFactory, $objectUtils, $textManipulator, $arrayMappers, $arrayFilter) {

  var updateDataUtils = {

    /**
     * gets data from all of the players in all valid leagues
     */
    updatePlayerPoolData: function (allPlayers) {

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

            rosterRequest.promise.then(function (playerData) {
              
              count += 1;

              // each player on each team
              var rosterArray = playerData.data.map($arrayMappers.transferPlayersMap.bind(this, leagueData, teamData));
              allPlayers = allPlayers.concat(rosterArray);
              
              console.log('count', count);
              
              if (count >= 140) {
                console.log('allPlayers', allPlayers);
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

          var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', player.id);

          playerProfileRequest.promise.then($arrayMappers.playerInfo.bind(this, player));

          playerProfileRequest.promise.then($arrayMappers.playerGamesLog.bind(this, { player: player, manager: manager }));

        });

      });

    },
    
    updateLeaguesData: function (leagues) {

      console.log('UPDATING ALL LEAGUES');

      var allLeagues = [];
      var consolidatedGoalScorers = [];

      // makes a request for all leagues in a loop returns a list of promises
      var allPromises = $apiFactory.getAllGoalLeaders();

      // waits for an array of promises to resolve, sets allLeagues data
      $apiFactory.listOfPromises(allPromises, function (result) {

        allLeagues = [];

        result.forEach(function (league, index) {
          var goalsMap = league.data.goals.map($arrayMappers.goalsMap.bind($arrayMappers, league.leagueURL));
          allLeagues.push({
            name: $textManipulator.properLeagueName(league.leagueName),
            source: goalsMap,
            img: $textManipulator.leagueImages[league.leagueName]
          });
          consolidatedGoalScorers = consolidatedGoalScorers.concat(goalsMap);
        });
        
        leagues = allLeagues;

      });

    }

  };
  
  return updateDataUtils;

});
