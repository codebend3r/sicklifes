/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMapper, $date, $textManipulator, $firebase) {

  $scope.loading = true;

  /*
   <div class='col-sm-4 col-xs-8'>{{game.alignment}} {{game.vsTeam}}</div>
   <div class='col-sm-1 col-xs-2 text-center'>{{game.goalsScored}}</div>
   <div class='col-sm-1 col-xs-2 text-center'>{{game.finalScore()}}</div>
   <div class='col-sm-3 hidden-xs'>{{game.leagueName}}</div>
   <div class='col-sm-3 hidden-xs'>{{game.datePlayed}}</div>
   */

  $scope.tableHeader = [
    {
      columnClass: 'col-sm-4 col-xs-8',
      text: 'Opponent'
    },
    {
      columnClass: 'col-sm-1 col-xs-2 text-center',
      text: 'G'
    },
    {
      columnClass: 'col-sm-1 col-xs-2 text-center',
      text: 'Final Score'
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

  $scope.filterAfterDate = function (game) {
    var gameDate = $date.create(game.box_score.event.game_date),
      isAfter = gameDate.isAfter('August 16 2014');
    //EPL - Aug 16
    //LIGA - Aug 25
    //SERI - Aug
    return isAfter;
  };

  var playerProfileCallBack = function (result) {

    var selectedInt = result.data.teams.length === 3 ? 1 : 0,
      id = $routeParams.playerID,
      teamName = result.data.teams[selectedInt].name,
      playerLeagueProfileRequest,
      leagueName = $textManipulator.getLeagueByURL(result.data.api_uri);

    console.log('leagueName', leagueName);

    playerLeagueProfileRequest = $apiFactory.getPlayerProfile(leagueName, id);

    playerLeagueProfileRequest.promise.then(function (profileData) {

      $scope.player.playerPos = profileData.data.position;
      $scope.player.weight = profileData.data.weight;
      $scope.player.height = profileData.data.height_feet + '\'' + profileData.data.height_inches;
      $scope.player.birthdate = profileData.data.birthdate;


    });

    $scope.player.playerName = $textManipulator.formattedFullName(result.data.first_name, result.data.last_name);
    $scope.player.playerTeam = teamName;
    $scope.player.leagueName = leagueName.toUpperCase();
    $scope.player.teamLogo = result.data.teams[selectedInt].sportsnet_logos.large;
    $scope.player.playerImage = result.data.headshots.original;

  };

  var init = function () {

    var id = $routeParams.playerID,
      playerProfileRequest = $apiFactory.getPlayerProfile('soccer', id),
      ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', id),
      eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', id),
      seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', id),
      chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', id),
      euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', id);


    playerProfileRequest.promise.then(playerProfileCallBack);

    ligaGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.ligaGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMapper.gameMapper);

      console.log('$scope.ligaGameDetails', $scope.ligaGameDetails);

    });


    eplGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.eplGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMapper.gameMapper);

    });


    seriGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.seriGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMapper.gameMapper);

    });


    chlgGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.chlgGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMapper.gameMapper);

    });


    euroGamesRequest.promise.then(function (result) {

      $scope.loading = false;
      $scope.euroGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMapper.gameMapper);

    });


  };

  init();

});