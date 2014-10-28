/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMappers, $date, $textManipulator, $q, $fireBaseService) {

  /*
   * TODO
   */
  $scope.loading = true;

  /*
   * TODO
   */
  $scope.tableHeader = [
    {
      columnClass: 'col-md-4 col-sm-4 col-xs-8',
      text: 'Opponent'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center',
      text: 'G'
    },
    {
      columnClass: 'col-md-1 hidden-sm hidden-xs text-center',
      text: 'Final Score'
    },
    {
      columnClass: 'col-md-3 col-sm-3 hidden-xs',
      text: 'League'
    },
    {
      columnClass: 'col-md-3 col-sm-3 col-xs-2',
      text: 'Date Played'
    }
  ];

  /*
   * TODO
   */
  $scope.player = {};

  /*
   * TODO
   */
  $scope.filterAfterDate = function (game) {
    var gameDate = $date.create(game.box_score.event.game_date),
      isAfter = gameDate.isAfter('August 16 2014');
    //EPL - Aug 16
    //LIGA - Aug 25
    //SERI - Aug 31
    return isAfter;
  };

  $scope.inLiga = false;
  $scope.inEPL = false;
  $scope.inSeri = false;
  $scope.inChlg = false;
  $scope.inEuro = false;

  /*
   * TODO
   */
  var playerProfileCallBack = function (result) {

    var selectedInt = result.data.teams.length - 1,
      id = $routeParams.playerID,
      teamName = result.data.teams[selectedInt].name,
      playerLeagueProfileRequest,
      profileLeague = function () {
        var l = '';
        result.data.teams.forEach(function (team, i) {
          team.leagues.forEach(function (league, j) {
            if ($textManipulator.acceptedLeague(league.slug)) {
              console.log('IN TEAM', i, result.data.teams[i].name);
              l = league.slug;
            }
          });
        });
        return l;
      },
      leagueName = function () {
        var l = '',
          n = 0;
        result.data.teams.forEach(function (team, i) {
          team.leagues.forEach(function (league, j) {
            if ($textManipulator.acceptedLeague(league.slug)) {
              n ? l += '/' + league.slug : l += league.slug;
              n += 1;
            }
          });
        });
        return l.toUpperCase();
      },
      checkInLeagues = function () {
        result.data.teams.forEach(function (team, i) {
          team.leagues.forEach(function (league, j) {
            if ($textManipulator.acceptedLeague(league.slug)) {
              if (league.slug === 'liga') $scope.inLiga = true;
              if (league.slug === 'epl') $scope.inEPL = true;
              if (league.slug === 'seri') $scope.inSeri = true;
              if (league.slug === 'chlg') $scope.inChlg = true;
              if (league.slug === 'uefa') $scope.inEuro = true;
            }
          });
        });
      };

    checkInLeagues();

    playerLeagueProfileRequest = $apiFactory.getPlayerProfile(profileLeague(), id);
    playerLeagueProfileRequest.promise.then(function (profileData) {
      $scope.player.playerPos = profileData.data.position;
      $scope.player.weight = profileData.data.weight;
      $scope.player.height = profileData.data.height_feet + '\'' + profileData.data.height_inches;
      $scope.player.birthdate = profileData.data.birthdate;
    });

    $scope.player.playerName = $textManipulator.formattedFullName(result.data.first_name, result.data.last_name);
    $scope.player.playerTeam = teamName;
    $scope.player.leagueName = leagueName;
    $scope.player.teamLogo = result.data.teams[selectedInt].sportsnet_logos.large;
    $scope.player.playerImage = result.data.headshots.original;

    populateGamesLog();

  };

  var populateGamesLog = function () {

    var ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', id),
      eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', id),
      seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', id),
      chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', id),
      euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', id),
      allLeaguePromises = [];

    console.log('$scope.inLiga', $scope.inLiga);
    console.log('$scope.inEPL', $scope.inEPL);
    console.log('$scope.inSeri', $scope.inSeri);
    console.log('$scope.inChlg', $scope.inChlg);
    console.log('$scope.inEuro', $scope.inEuro);

    if ($scope.inLiga) {

      ligaGamesRequest.promise.then(function (result) {
        $scope.loading = false;
        $scope.ligaGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
        allGamesLog = allGamesLog.concat($scope.ligaGameDetails);
      }, function () {
        console.log('LIGA FAIL');
      });

      allLeaguePromises.push(ligaGamesRequest.promise);

    }

    if ($scope.inEPL) {

      eplGamesRequest.promise.then(function (result) {
        $scope.loading = false;
        $scope.eplGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
        allGamesLog = allGamesLog.concat($scope.eplGameDetails);
      }, function () {
        console.log('EPL FAIL');
      });

      allLeaguePromises.push(eplGamesRequest.promise);
    }

    if ($scope.inSeri) {

      seriGamesRequest.promise.then(function (result) {
        $scope.loading = false;
        $scope.seriGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
        allGamesLog = allGamesLog.concat($scope.seriGameDetails);
      }, function () {
        console.log('SERI FAIL');
      });
      allLeaguePromises.push(seriGamesRequest.promise);

    }

    if ($scope.inChlg) {

      chlgGamesRequest.promise.then(function (result) {
        $scope.loading = false;
        $scope.chlgGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
        allGamesLog = allGamesLog.concat($scope.chlgGameDetails);
      }, function () {
        console.log('CHLG FAIL');
      });

      allLeaguePromises.push(chlgGamesRequest.promise);
    }

    if ($scope.inEuro) {

      euroGamesRequest.promise.then(function (result) {
        $scope.loading = false;
        $scope.euroGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
        allGamesLog = allGamesLog.concat($scope.euroGameDetails);
      }, function () {
        console.log('EURO FAIL');
      });

      allLeaguePromises.push(euroGamesRequest.promise);

    }

    $q.all(allLeaguePromises).then(function () {

      console.log('ALL LEAGUE DATA FULFILLED');
      saveGameLogs(allGamesLog);

    });

  };

  var allGamesLog = [];

  var saveGameLogs = function (allGames) {

    //console.log('allGames', allGames.length);

    $scope.allManagers.forEach(function (manager) {

      manager.players.forEach(function (player) {

        if (player.id === id) {
          player.gamesLog = allGames;
        }

      });

    });

    console.log('//////////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('//////////////////////////////////////////');

    var saveObject = {
      __lastSynedOn: $date.create(),
      //__allPlayers: $scope.allPlayers,
      //__allLeagues: $scope.allLeagues,
      //__allTeams: $scope.allTeams,
      chester: $scope.allManagers[0],
      frank: $scope.allManagers[1],
      dan: $scope.allManagers[2],
      justin: $scope.allManagers[3],
      mike: $scope.allManagers[4],
      joe: $scope.allManagers[5]
    };

    console.log('saveObject', saveObject);
    //$fireBaseService.syncLeagueTeamData(saveObject);

  };

  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded');

    var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', id);

    $scope.loading = false;

    $scope.allManagers = [
      data.leagueTeamData.chester,
      data.leagueTeamData.frank,
      data.leagueTeamData.dan,
      data.leagueTeamData.justin,
      data.leagueTeamData.mike,
      data.leagueTeamData.joe
    ];

    $scope.allLeagues = data.__allLeagues;

    playerProfileRequest.promise.then(playerProfileCallBack);


  };

  var id = Number($routeParams.playerID);

  /*
   * TODO
   */
  var init = function () {

    id = Number($routeParams.playerID);

    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();

    firePromise.promise.then(fireBaseLoaded);

  };

  init();

});