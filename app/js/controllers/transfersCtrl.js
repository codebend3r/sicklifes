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

  /**
   * route param
   * @type {*|$scope.admin}
   */
  $scope.admin = $routeParams.admin;

  /**
   * header for table
   * @type {{columnClass: string, text: string}[]}
   */
  $scope.tableHeader = [
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2',
      text: 'id'
    },
    {
      columnClass: 'col-md-3 col-sm-4 col-xs-4',
      text: 'Player'
    },
    {
      columnClass: 'col-md-3 col-sm-6 col-xs-4',
      text: 'Owned By'
    },
    {
      columnClass: 'col-md-2 col-sm-6 col-xs-4',
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
    //console.log('$scope.allPlayers', $scope.allPlayers);
    console.log('LENGTH', $scope.allPlayers.length);
    console.log('////////////////////////////////////');

    var allPlayersObject = {
      _syncedFrom: 'transfersCtrl',
      _lastSynedOn: $dateService.syncDate(),
      allPlayers: $scope.allPlayers
    };

    //$fireBaseService.syncAllPlayersList(allPlayersObject);
    
    console.log('////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('////////////////////////////////////');
    
    debugger;

    var managersObject = {
      _syncedFrom: 'transfersCtrl',
      _lastSynedOn: $dateService.syncDate(),
      chester: $scope.allManagers[0],
      frank: $scope.allManagers[1],
      dan: $scope.allManagers[2],
      justin: $scope.allManagers[3],
      mike: $scope.allManagers[4],
      joe: $scope.allManagers[5]
    };

    $fireBaseService.syncLeagueTeamData(managersObject);

  };

  $scope.allPlayers = [];

  /**
   * called from ng-click, makes a request from TheScore to get new data
   */
  $scope.updateData = function () {

    console.log('UPDATING...');

    var allTeams = $apiFactory.getAllTeams();

    console.log('$scope.allPlayers', $scope.allPlayers);

    $scope.allPlayers = [];

    // returns a list of promise with the end point for each league
    $apiFactory.listOfPromises(allTeams, function (result) {

      result.forEach(function (leagueData) {

        leagueData.data.forEach(function (teamData) {

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

  };

  $scope.addPlayer = function (player) {

    console.log('addPlayer --> player', player);

  };

  $scope.dropPlayer = function (player) {

    console.log('dropPlayer --> player', player);

  };

  /**
   * callback data when firebase is loaded
   */
  var fireBaseLoaded = function (data) {

    $scope.loading = false;

    $scope.allPlayers = data.allPlayersData.allPlayers;

    $scope.allManagers = [
      data.leagueTeamData.chester,
      data.leagueTeamData.frank,
      data.leagueTeamData.dan,
      data.leagueTeamData.justin,
      data.leagueTeamData.mike,
      data.leagueTeamData.joe
    ];
    
    console.log('syncDate allPlayers', data.allPlayersData._lastSynedOn);
    
    //makeTransactions();
    
  }
  
  var makeTransactions = function() {    

    $scope.allManagers.forEach(function (manager) {
      manager.players.forEach(function (eachPlayer) {
        eachPlayer.status = 'active'
      });
    });
    
    var dan = $scope.allManagers[2];

    dan.transactions = [];

    dan.transactions.push({

      add: {
        id: '281',
        playerName: 'Jonathan BIABIANY',
        league: 'SERIE A',
        dateOfTransaction: $dateService.transactionDate()
      },
      drop: {
        id: '30268',
        playerName: 'Filip DJORDJEVIC',
        league: 'SERIE A',
        dateOfTransaction: $dateService.transactionDate()
      }

    });

    dan.players.forEach(function (eachPlayer) {
      if (eachPlayer.id === 281) {
        eachPlayer.status = 'dropped';
        eachPlayer.dateOfTransaction = $dateService.transactionDate()
      }
    });

    //clGoals: 1, domesticGoals: 0, eGoals: 0, goals: 1, id: 3405, league: "EPL", leagueGoals: 1, playerName: "Lukas PODOLSKI", points: 2, status: "active", teamName: "ARSENAL"

    dan.players.push({

      id: 30268,
      clGoals: 0,
      domesticGoals: 0,
      eGoals: 0,
      goals: 0,
      leagueGoals: 0,
      league: 'SERI',
      playerName: 'Filip DJORDJEVIC',
      teamName: 'Lazio',
      status: 'added',
      dateOfTransaction: $dateService.transactionDate()

    });

    console.log('dan', dan);
    //$scope.allManagers[2] = dan;
    console.log('$scope.allManagers', $scope.allManagers);

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
