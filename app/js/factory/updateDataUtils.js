/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.factory('$updateDataUtils', function ($apiFactory, $objectUtils, $textManipulator, $arrayMappers, $arrayFilter) {

  return {

    /**
     * gets data from all of the players in all valid leagues
     */
    updatePlayerPoolData: function (allPlayers) {

      console.log('UPDATING PLAYER POOL...');

      var allTeams = $apiFactory.getAllTeams();

      allPlayers = [];

      // returns a list of promise with the end point for each league
      $apiFactory.listOfPromises(allTeams, function (result) {

        result.forEach(function (leagueData) {

          leagueData.data.forEach(function (teamData) {

            var url = $textManipulator.getTeamRosterURL(leagueData.leagueName, teamData.id);

            // returns a promise with the end point for each team
            var rosterRequest = $apiFactory.getData({
              endPointURL: url
            });

            rosterRequest.promise.then(function (playerData) {

              // each player on each team
              var rosterArray = playerData.data.map($arrayMappers.transferPlayersMap.bind(this, leagueData, teamData));
              allPlayers = allPlayers.concat(rosterArray);

            });

          });

        });


      });

    },

    /**
     * gets data from all of the players in all valid leagues
     */
    updateAllManagerData: function (allManagers) {

      console.log('UPDATING ALL MANAGERS...', allManagers);

      var allLeaguePromises = [];

      allManagers.forEach(function (manager) {

        // reset goal counts
        manager = $objectUtils.cleanManager(manager, true);

        manager.seriCount = 0;
        manager.ligaCount = 0;
        manager.eplCount = 0;
        manager.wildCardCount = 0;

        manager.players.forEach(function (player) {

          player = $objectUtils.playerResetGoalPoints(player)

          var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', player.id);

          playerProfileRequest.promise.then(function (result) {

            var selectedInt = 0,
              teamName = result.data.teams[selectedInt].name,
              playerLeagueProfileRequest,
              profileLeague = $textManipulator.getLeagueSlug(result);

            // based on player result data return an object with the valid leagues for this player
            //validLeagues = $textManipulator.getPlayerValidLeagues(result);

            // name of player
            //player.playerName = $textManipulator.formattedFullName(result.data.first_name, result.data.last_name);

            // team player belongs to
            //player.playerTeam = teamName;

            // get all valid league names string seperated by slashes
            //player.leagueName = $textManipulator.validLeagueNamesFormatted(result);

            player.teamLogo = result.data.teams[selectedInt].sportsnet_logos.large;

            player.playerImage = result.data.headshots.original;

            player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

            player.validLeagues = $textManipulator.getPlayerValidLeagues(result);

            ///////////////////////////////////

            playerLeagueProfileRequest = $apiFactory.getPlayerProfile(profileLeague, player.id);
            playerLeagueProfileRequest.promise.then(function (profileData) {

              player.playerPos = profileData.data.position;
              player.weight = profileData.data.weight;
              player.height = profileData.data.height_feet + '\'' + profileData.data.height_inches;
              player.birthdate = profileData.data.birthdate;

            });

            console.log('player', player);

            //////////////////////////////

            // based on player result data return an object with the valid leagues for this player
            var validLeagues = player.validLeagues,
              ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id),
              eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id),
              seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id),
              chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id),
              euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

            if (validLeagues.inLiga) {
              if (player.status !== 'dropped') manager.ligaCount += 1;
              ligaGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.ligaGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(ligaGamesRequest.promise);
            }

            if (validLeagues.inEPL) {
              if (player.status !== 'dropped') manager.eplCount += 1;
              eplGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.eplGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(eplGamesRequest.promise);
            }

            if (validLeagues.inSeri) {
              if (player.status !== 'dropped') manager.seriCount += 1;
              seriGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.seriGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(seriGamesRequest.promise);
            }

            if (validLeagues.inChlg) {
              chlgGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.chlgGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(chlgGamesRequest.promise);
            }

            if (validLeagues.inEuro) {
              euroGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.euroGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(euroGamesRequest.promise);
            }

            // logical definition for a wildcard player
            if ((validLeagues.inChlg || validLeagues.inEuro) && !validLeagues.inLiga && !validLeagues.inEPL && !validLeagues.inSeri) {
              if (player.status !== 'dropped') manager.wildCardCount += 1;
            }

          });

        });

        $apiFactory.listOfPromises(allLeaguePromises, function () {

          console.log('DONE...');

        });

      });

    },

    playerProfileCallBack: function (player, result) {

      var selectedInt = 0,
        teamName = result.data.teams[selectedInt].name,
        // based on player result data return an object with the valid leagues for this player
        validLeagues = $textManipulator.getPlayerValidLeagues(result);

      // name of player
      player.playerName = $textManipulator.formattedFullName(result.data.first_name, result.data.last_name);

      // team player belongs to
      player.playerTeam = teamName;

      // get all valid league names string seperated by slashes
      player.leagueName = $textManipulator.validLeagueNamesFormatted(result);

      player.teamLogo = result.data.teams[selectedInt].sportsnet_logos.large;

      player.playerImage = result.data.headshots.original;

      //populatePlayerProfile(playerID, result);

    }

  };

});
