/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMapper, $date) {

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
      leagueName: game.box_score.event.league.slug.toUpperCase(),
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
      ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', id),
      eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', id),
      seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', id),
      chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', id),
      euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', id);

    playerProfileRequest.promise.then(function (result) {
      $scope.player.playerName = result.data.first_name + ' ' + result.data.last_name.toUpperCase();
      $scope.player.playerImage = result.data.headshots.original;
    });

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

  $scope.isActive = function (viewLocation) {
    return viewLocation === '/players/';
  };


});