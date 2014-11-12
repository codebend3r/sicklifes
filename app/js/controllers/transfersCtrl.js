/**
 * Created by Bouse on 11/11/2014
 */

sicklifesFantasy.controller('transfersCtrl', function ($scope, $fireBaseService, $apiFactory, $arrayMappers, $dateService, $routeParams) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  /**
   * TODO
   */
  $scope.loading = true;
  
  $scope.admin = $routeParams.admin;
  
  $scope.tableHeader = [
    {
      columnClass: 'col-md-3 col-sm-6 col-xs-4',
      text: 'Player'
    },
    {
      columnClass: 'col-md-3 col-sm-6 col-xs-4',
      text: 'Owned By'
    },
    {
      columnClass: 'col-md-3 col-sm-6 col-xs-4',
      text: 'League'
    },
    {
      columnClass: 'col-md-3 col-sm-6 col-xs-4',
      text: 'Team'
    }
  ];

  /**
   * save data to firebase
   */
  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allPlayers', $scope.allPlayers);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'transfersCtrl',
      _lastSynedOn: $dateService.syncDate(),
      allPlayers: $scope.allPlayers,
    };

    $fireBaseService.syncAllPlayersList(saveObject);

  };
  
  $scope.allPlayers = [];

  /**
   * called from ng-click, makes a request from TheScore to get new data
   */
  $scope.updateData = function () {

    console.log('UPDATING...');
    
    var allTeams = $apiFactory.getAllTeams();
    
    // returns a list of promise with the end point for each league
    $apiFactory.listOfPromises(allTeams, function (result) {
      
      result.forEach(function (leagueData) {
        
        leagueData.data.forEach(function(teamData) {
        
          // returns a promise with the end point for each team
          var rosterRequest = $apiFactory.getData({
            endPointURL: leagueData.leagueURL + teamData.id + '/players/'
          });

          rosterRequest.promise.then(function (playerData) {

            // each player on each team
            var rosterArray = playerData.data.map($arrayMappers.transferPlayersMap.bind($scope, leagueData, teamData));
            $scope.allPlayers = $scope.allPlayers.concat(rosterArray);

          });
          
        });

      });
      

    });
    
    //listOfResults = listOfResults.concat(result);
    
    //console.log('$apiFactory.getAllTeams()', $apiFactory.getAllTeams());


  };

  /**
   * callback data when firebase is loaded
   */
  var fireBaseLoaded = function (data) {

    $scope.loading = false;

    $scope.allPlayers = data.allPlayersData.allPlayers;

    console.log('syncDate allPlayers', data.allPlayersData._lastSynedOn);
    //$scope.updateData();

  };

  /**
   * init controller
   */
  var init = function () {

    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();

    firePromise.promise.then(fireBaseLoaded);


  };


  init();

});
