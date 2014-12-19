/**
 * Updated by Bouse on 12/06/2014
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

        manager.seriCount = 0;
        manager.ligaCount = 0;
        manager.eplCount = 0;
        manager.wildCardCount = 0;

        manager.players.forEach(function (player) {

          player = $objectUtils.playerResetGoalPoints(player);

          var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', player.id);

          playerProfileRequest.promise.then($arrayMappers.playerInfo.bind(this, player));
          
          playerProfileRequest.promise.then(function (result) {

            //////////////////////////////

            // based on player result data return an object with the valid leagues for this player
            var validLeagues = player.validLeagues,
              ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id),
              eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id),
              seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id),
              chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id),
              euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

            if (validLeagues.inLiga) {
              // if player is not dropped then count on active roster
              if (player.status !== 'dropped') manager.ligaCount += 1;
              ligaGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.ligaGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                player.domesticLeagueName = $textManipulator.formattedLeagueName('liga');
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(ligaGamesRequest.promise);
            }

            if (validLeagues.inEPL) {
              // if player is not dropped then count on active roster
              if (player.status !== 'dropped') manager.eplCount += 1;
              eplGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.eplGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                player.domesticLeagueName = $textManipulator.formattedLeagueName('epl');
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(eplGamesRequest.promise);
            }

            if (validLeagues.inSeri) {
              // if player is not dropped then count on active roster
              if (player.status !== 'dropped') manager.seriCount += 1;
              seriGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.seriGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                player.domesticLeagueName = $textManipulator.formattedLeagueName('seri');
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(seriGamesRequest.promise);
            }

            if (validLeagues.inChlg) {
              chlgGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.chlgGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                player.tournamentLeagueName = $textManipulator.formattedLeagueName('chlg');
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(chlgGamesRequest.promise);
            }

            if (validLeagues.inEuro) {
              euroGamesRequest.promise.then(function (result) {
                var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map($arrayMappers.monthlyMapper.bind(this, manager, player));
                player.euroGameLog = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
                player.tournamentLeagueName = $textManipulator.formattedLeagueName('uefa');
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
              });
              allLeaguePromises.push(euroGamesRequest.promise);
            }

            // logical definition for a wildcard player
            if ((validLeagues.inChlg || validLeagues.inEuro) && !validLeagues.inLiga && !validLeagues.inEPL && !validLeagues.inSeri) {
              // if player is not dropped then count on active roster
              if (player.status !== 'dropped') manager.wildCardCount += 1;
            }

          });

        });

        $apiFactory.listOfPromises(allLeaguePromises, function () {

          //console.log('DONE...');

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
          console.log('league.leagueName', league.leagueName);
          allLeagues.push({
            name: $textManipulator.properLeagueName(league.leagueName),
            source: goalsMap,
            img: $textManipulator.leagueImages.liga
          });
          consolidatedGoalScorers = consolidatedGoalScorers.concat(goalsMap);
        });

        leagues = allLeagues;
        console.log('> leagues', leagues);

        /*var allLeagues = [
        {
          name: $textManipulator.leagueLongNames.liga,
          source: data.leagueData.LIGA,
          img: $textManipulator.leagueImages.liga
        },
        {
          name: $textManipulator.leagueLongNames.epl,
          source: data.leagueData.EPL,
          img: $textManipulator.leagueImages.epl
        },
        {
          name: $textManipulator.leagueLongNames.seri,
          source: data.leagueData.SERI,
          img: $textManipulator.leagueImages.seri
        },
        {
          name: $textManipulator.leagueLongNames.chlg,
          source: data.leagueData.CHLG,
          img: $textManipulator.leagueImages.chlg
        },
        {
          name: $textManipulator.leagueLongNames.euro,
          source: data.leagueData.UEFA,
          img: $textManipulator.leagueImages.euro
        }
      ];*/
        

      });

    }

  };
  
  return updateDataUtils;

});
