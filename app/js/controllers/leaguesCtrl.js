/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams, $location, $arrayMapper, $firebase, localStorageService) {

  var ref = new Firebase('https://glaring-fire-9383.firebaseio.com/'),
    sync = $firebase(ref);

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 small-hpadding',
      text: 'Rank'
    },
    {
      columnClass: 'col-md-4 col-sm-4 col-xs-8 small-hpadding',
      text: 'Player'
    },
    {
      columnClass: 'col-md-2 col-sm-4 hidden-xs small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-3 col-sm-4 hidden-xs small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-2 col-sm-2 col-xs-2 text-center small-hpadding',
      text: 'G'
    }
  ];

  $scope.allRequest = [];

  $scope.changeLeague = function (league) {

    console.log('change leagues', league);

  };

  var defineAllData = function() {

    return [
      {
        name: 'La Liga',
        source:$scope.allLeagueDataObj.liga
      },
      {
        name: 'EPL',
        source: $scope.allLeagueDataObj.epl
      },
      {
        name: 'Serie A',
        source: $scope.allLeagueDataObj.seri
      },
      {
        name: 'Champions League',
        source: $scope.allLeagueDataObj.chlg
      },
      {
        name: 'Europa League',
        source: $scope.allLeagueDataObj.uefa
      }
    ];

  };

  var allRequestComplete = function () {

    $scope.loading = false;

    $scope.allLeagues = defineAllData();

    $scope.selectedLeague = $scope.allLeagues[0];

    syncLeagueData();

  };

  var getFireBaseData = function() {

    $scope.loading = false;

    $scope.leagueData = sync.$asArray();

    ref.on('value', function (snapshot) {

      $scope.allLeagues = [
        {
          name: 'La Liga',
          source: snapshot.val().leagueData.LIGA
      },
        {
          name: 'EPL',
          source: snapshot.val().leagueData.EPL
        },
        {
          name: 'Serie A',
          source: snapshot.val().leagueData.SERI
        },
        {
          name: 'Champions League',
          source: snapshot.val().leagueData.CHLG
        },
        {
          name: 'Europa League',
          source: snapshot.val().leagueData.UEFA
        }
      ];

      $scope.selectedLeague = $scope.allLeagues[0];
      console.log('SELECTED LEAGUE', $scope.selectedLeague);

    }, function (errorObject) {

      console.log('The read failed: ' + errorObject.code);

    });

  };

  var syncLeagueData = function() {

    console.log('syncLeagueData');

    var usersRef = ref.child('leagueData');
    usersRef.set({
      LIGA: $scope.allLeagueDataObj.liga,
      EPL: $scope.allLeagueDataObj.epl,
      SERI: $scope.allLeagueDataObj.seri,
      CHLG: $scope.allLeagueDataObj.chlg,
      UEFA: $scope.allLeagueDataObj.uefa
    });

  };

  $scope.updateData = function() {

    $scope.allRequest = [];

    $scope.allLeagueDataObj = {
      cb: allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

  $scope.init = function () {

    //localStorageService.clearAll();

    if (localStorageService.get('allLeagues')) {
      //getFireBaseData();
      //allRequestComplete();
      //$scope.updateData();
    } else {
      //getFireBaseData();
      //allRequestComplete();
      //$scope.updateData();
    }

    getFireBaseData();
    //allRequestComplete();
    //$scope.updateData();

  };

  $scope.init();

});
