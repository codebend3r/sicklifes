/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMappers, $date, $textManipulator, $firebase) {

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

  /*
   * TODO
   */
  var playerProfileCallBack = function (result) {

    var selectedInt = result.data.teams.length === 3 ? 1 : 0,
      id = $routeParams.playerID,
      teamName = result.data.teams[selectedInt].name,
      playerLeagueProfileRequest,
      leagueName = function () {
        var length = result.data.teams[0].leagues.length - 1,
          leaguesString = result.data.teams[0].leagues[0].slug.toUpperCase();
        return leaguesString;
      };

    playerLeagueProfileRequest = $apiFactory.getPlayerProfile(leagueName(), id);
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

  };

  /*
   * TODO
   */
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
      $scope.ligaGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
      console.log('$scope.ligaGameDetails', $scope.ligaGameDetails);
    });
    
    eplGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.eplGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
    });
    
    seriGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.seriGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
    });
    
    chlgGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.chlgGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
    });
    
    euroGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.euroGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
    });


  };

  init();

});