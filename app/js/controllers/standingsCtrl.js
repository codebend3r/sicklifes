/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $q, $routeParams, $firebase, $arrayMapper, $filter, $textManipulator, $scoringLogic, $leagueTeams, $location, localStorageService) {

  var ref = new Firebase('https://glaring-fire-9383.firebaseio.com/'),
    sync = $firebase(ref);

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-4 col-xs-4 small-hpadding',
      hoverTitle: 'Team',
      text: 'Team'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Domestic Goals',
      text: 'DG'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Champions League Goals',
      text: 'CLG'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Europa League Goals',
      text: 'EG'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Total Points',
      text: 'PTS'
    }
  ];

  /**
   *
   * @param league
   * @param id
   * @returns {string}
   */
  $scope.getPlayerURL = function (league, id) {
    var url = 'http://api.thescore.com/' + league + '/players/' + id + '/player_records?rpp=100';
    return url;
  };

  /**
   *
   */
  $scope.allRequestComplete = function () {

    $scope.loading = false;

    $scope.allTeams = [
      $leagueTeams.chester,
      $leagueTeams.frank,
      $leagueTeams.dan,
      $leagueTeams.justin,
      $leagueTeams.mike,
      $leagueTeams.joe
    ];

    localStorageService.set('allTeams', $scope.allTeams);

    $scope.allPlayers = $scope.allLeagueDataObj.allLeagues;

    $scope.populateTable();

  };

  var saveToFireBase = function() {

    console.log('saveToFireBase');

    console.log('$scope.allTeams', $scope.allTeams);
    console.log('$scope.allTeams --> goals', $scope.allTeams[0].players[0].playerName);
    console.log('$scope.allTeams --> goals', $scope.allTeams[0].players[0].goals);
    console.log('$scope.allTeams --> domesticGoals', $scope.allTeams[0].players[0].domesticGoals);

    var usersRef = ref.child('leagueTeamData');
    usersRef.set({
      __allPlayers: $scope.allPlayers,
      __allLeagues: $scope.allLeagueDataObj.allLeagues,
      CHESTER: $leagueTeams.chester.players,
      FRANK: $leagueTeams.frank.players,
      DAN: $leagueTeams.dan.players,
      JUSTIN: $leagueTeams.justin.players,
      MIKE: $leagueTeams.mike.players,
      JOE: $leagueTeams.joe.players
    });

  };

  var getFireBaseData = function() {

    ref.on('value', function (snapshot) {

      $scope.allTeams = [
        snapshot.val().leagueTeamData.CHESTER,
        snapshot.val().leagueTeamData.FRANK,
        snapshot.val().leagueTeamData.DAN,
        snapshot.val().leagueTeamData.JUSTIN,
        snapshot.val().leagueTeamData.MIKE,
        snapshot.val().leagueTeamData.JOE
      ];

      $scope.allPlayers = snapshot.val().__allLeagues;
      $scope.populateTable();

      console.log('SELECTED LEAGUE', $scope.selectedLeague);

    }, function (errorObject) {

      console.log('The read failed: ' + errorObject.code);

    });

  };

  /**
   *
   */
  $scope.populateTable = function () {

    $scope.allTeams.forEach(function (team) {

      team.totalPoints = 0;

      team.players.forEach($arrayMapper.forEachPlayer.bind($scope, $scope, team));

    });

    setTimeout(saveToFireBase, 9000);
    //localStorageService.set('allTeams', $scope.allTeams);

  };

  $scope.updateData = function() {
    $scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);
  };

  /**
   *
   */
  $scope.init = function () {

    /*$scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);*/

    if (localStorageService.get('allLeagues')) {

      /*$scope.allLeaguesData = localStorageService.get('allLeagues');
      $scope.allRequestComplete();*/
      //$scope.updateData();
      getFireBaseData();

    } else {

      //$scope.updateData();
      getFireBaseData();

    }

  };


  $scope.init();

});
