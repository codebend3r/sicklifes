/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMappers, $date, $textManipulator, $fireBaseService) {

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
    
    console.log('==============================');
    console.log('playerProfileCallBack');
    console.log('==============================');

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
  
  var fireBaseLoaded = function (data) {
    
    console.log('==============================');
    console.log('fireBaseLoaded');
    console.log('==============================');
    
    var id = $routeParams.playerID,
      playerProfileRequest = $apiFactory.getPlayerProfile('soccer', id),
      ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', id),
      eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', id),
      seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', id),
      chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', id),
      euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', id);

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

    ligaGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.ligaGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
      console.log('$scope.ligaGameDetails', $scope.ligaGameDetails);
    }, function() {
      console.log('LIGA FAIL');
    });
    
    eplGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.eplGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
      console.log('$scope.eplGamesRequest', $scope.eplGamesRequest);
    }, function() {
      console.log('EPL FAIL');
    });
    
    seriGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.seriGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
      console.log('$scope.seriGamesRequest', $scope.seriGamesRequest);
    }, function() {
      console.log('SERI FAIL');
    });
    
    chlgGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.chlgGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
      console.log('$scope.chlgGamesRequest', $scope.chlgGamesRequest);
    }, function() {
      console.log('CHLG FAIL');
    });
    
    euroGamesRequest.promise.then(function (result) {
      $scope.loading = false;
      $scope.euroGameDetails = result.data.filter($scope.filterAfterDate).map($arrayMappers.gameMapper);
      console.log('$scope.euroGamesRequest', $scope.euroGamesRequest);
    }, function() {
      console.log('EURO FAIL');
    });


    };

  /*
   * TODO
   */
  var init = function () {
    
    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();
    
    firePromise.promise.then(fireBaseLoaded);

  };

  init();

});