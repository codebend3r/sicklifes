/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMapper, $date, $textManipulator) {

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-sm-5 col-xs-10',
      text: 'Opponent'
    },
    {
      columnClass: 'col-sm-1 col-xs-2 text-center',
      text: 'G'
    },
    {
      columnClass: 'col-sm-3 hidden-xs',
      text: 'League'
    },
    {
      columnClass: 'col-sm-3 hidden-xs',
      text: 'Date Played'
    }
  ];

  $scope.player = {};

  $scope.gameMapper = function (game) {

    return {
      alignment: game.alignment === 'away' ? '@' : 'vs',
      vsTeam: game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name,
      goalsScored: game.goals,
      leagueName: $textManipulator.formattedLeagueName(game.box_score.event.league.slug),
      datePlayed: $date.create(game.box_score.event.game_date).format('{dd}/{MM}/{yy}')
    };
  };

  $scope.filterAfterDate = function (game) {
    var gameDate = $date.create(game.box_score.event.game_date);
    var isAfter = gameDate.isAfter('September 1 2014');
    return isAfter;
  };

  $scope.init = function () {

    var id = $routeParams.playerID,
      playerProfileRequest = $apiFactory.getPlayerProfile('soccer', id),
      playerLeagueProfileRequest,
      ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', id),
      eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', id),
      seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', id),
      chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', id),
      euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', id);

    var playerProfileCallBack = function (result) {

      var selectedInt = result.data.teams.length === 3 ? 1 : 0;
      var teamName = result.data.teams[selectedInt].name;
      var leagueName = $textManipulator.getLeagueByURL(result.data.api_uri);

      console.log('leagueName', leagueName);

      playerLeagueProfileRequest = $apiFactory.getPlayerProfile(leagueName, id);

      playerLeagueProfileRequest.promise.then(function(profileData) {

        console.log('================================');
        console.log('>>>>>>>>>>>', profileData);
        console.log('================================');
        $scope.player.playerPos = profileData.data.position;
        $scope.player.weight = profileData.data.weight;
        $scope.player.height = profileData.data.height_feet + '\'' + profileData.data.height_inches;
        $scope.player.birthdate = profileData.data.birthdate

      });

      

      $scope.player.playerName = $textManipulator.formattedFullName(result.data.first_name, result.data.last_name);
      $scope.player.playerTeam = teamName;
      $scope.player.leagueName = leagueName.toUpperCase();
      $scope.player.teamLogo = result.data.teams[selectedInt].sportsnet_logos.large;
      $scope.player.playerImage = result.data.headshots.original;

    };

    playerProfileRequest.promise.then(playerProfileCallBack);

    /*if (leagueName === 'liga') {

    } else if (leagueName === 'epl') {

    } else if (leagueName === 'seri') {

    } else if (leagueName === 'chlg') {

    } else if (leagueName === 'uefa') {

    }*/

    ligaGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.ligaGameDetails = result.data.filter($scope.filterAfterDate).map($scope.gameMapper);

    });


    eplGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.eplGameDetails = result.data.filter($scope.filterAfterDate).map($scope.gameMapper);

    });


    seriGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.seriGameDetails = result.data.filter($scope.filterAfterDate).map($scope.gameMapper);

    });


    chlgGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.chlgGameDetails = result.data.filter($scope.filterAfterDate).map($scope.gameMapper);

    });


    euroGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.euroGameDetails = result.data.filter($scope.filterAfterDate).map($scope.gameMapper);

    });


  };

  $scope.init();

});