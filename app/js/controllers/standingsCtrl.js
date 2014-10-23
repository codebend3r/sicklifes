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
  var allRequestComplete = function () {

    console.log('allRequestComplete');

    $scope.loading = false;

    $scope.allTeams = [
      $leagueTeams.chester,
      $leagueTeams.frank,
      $leagueTeams.dan,
      $leagueTeams.justin,
      $leagueTeams.mike,
      $leagueTeams.joe
    ];

    //localStorageService.set('allTeams', $scope.allTeams);

    $scope.allPlayers = $scope.allLeagueDataObj.allLeagues;

    populateTable();

  };

  /**
   *
   */
  var populateTable = function () {

    console.log('populateTable', allTeams);
      
    var masterDeferredList = [];

    // 1st loop
    $scope.allTeams.forEach(function (team) {      

      team.totalPoints = 0;
      
      // clear team deferred before the loop that populates it
      team.deferredList = [];

      // 2nd loop
      team.players.forEach($arrayMapper.forEachPlayer.bind($scope, $scope, team));
      
      masterDeferredList = masterDeferredList.concat(team.deferredList);
      team.deferredList = [];

    });
    
    console.log('END --> masterDeferredList.length:', masterDeferredList.length);
    
    setTimeout(saveToFireBase, 8000);
    
    /*$q.all(masterDeferredList).then(function (result) {

      console.log('********** DONE');
      //saveToFireBase();
      //localStorageService.set('allTeams', $scope.allTeams);

    }, function() {
      
      console.log('********** ERROR');
      
    });*/
  

  };

  var saveToFireBase = function() {

    console.log('saveToFireBase');

    var usersRef = ref.child('leagueTeamData');
    
    delete $leagueTeams.chester.$$hashKey;
    delete $leagueTeams.frank.$$hashKey;
    delete $leagueTeams.dan.$$hashKey;
    delete $leagueTeams.justin.$$hashKey;
    delete $leagueTeams.mike.$$hashKey;
    delete $leagueTeams.joe.$$hashKey;
    
    var saveObject = {
      __allPlayers: $scope.allPlayers,
      __allLeagues: $scope.allLeagueDataObj.allLeagues,
      //__allTeams: $scope.allTeams,
      chester: $leagueTeams.chester,
      frank: $leagueTeams.frank,
      dan: $leagueTeams.dan,
      justin: $leagueTeams.justin,
      mike: $leagueTeams.mike,
      joe: $leagueTeams.joe
    };
    
    usersRef.set(saveObject);

  };
  
  var populateTableFromFireBase = function(snapshot) {
    
    console.log('populateTableFromFireBase');
    
    $scope.loading = false;

      $scope.allTeams = allTeams = [
        snapshot.val().leagueTeamData.chester,
        snapshot.val().leagueTeamData.frank,
        snapshot.val().leagueTeamData.dan,
        snapshot.val().leagueTeamData.justin,
        snapshot.val().leagueTeamData.mike,
        snapshot.val().leagueTeamData.joe
      ];

      $scope.allPlayers = snapshot.val().__allLeagues;
    
  };

  var getFireBaseData = function() {

    console.log('getFireBaseData');

    ref.on('value', populateTableFromFireBase, function (errorObject) {

      console.log('The read failed: ' + errorObject.code);

    });

  };

  $scope.updateData = function() {

    console.log('updateData');

    $scope.allLeagueDataObj = {
      cb: allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

  /**
   *
   */
  $scope.init = function () {

    if (localStorageService.get('allLeagues')) {

      /*$scope.allLeaguesData = localStorageService.get('allLeagues');
      $scope.allRequestComplete();*/
      //$scope.updateData();
      //getFireBaseData();
      //saveToFireBase();

    } else {

      //$scope.updateData();
      //getFireBaseData();
      //saveToFireBase();

    }

    //$scope.updateData();
    getFireBaseData();
    //saveToFireBase();


  };


  $scope.init();

});
