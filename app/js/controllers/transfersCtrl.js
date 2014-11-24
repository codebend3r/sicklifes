/**
 * Created by Bouse on 11/23/2014
 */

sicklifesFantasy.controller('transfersCtrl', function ($scope, $fireBaseService, $apiFactory, $modal, $arrayMappers, $dateService, $routeParams) {

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
      text: 'ID'
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

  $scope.managersTableHeader = [
    {
      columnClass: 'col-md-4 col-sm-5 col-xs-6',
      text: 'Player',
      hoverText: 'Player',
      orderCriteria: 'player'
    },
    {
      columnClass: 'col-md-3 col-sm-4 hidden-xs',
      text: 'Team',
      hoverText: 'Team',
      orderCriteria: 'team'
    },
    {
      columnClass: 'col-md-2 hidden-sm hidden-xs',
      text: 'League',
      hoverText: 'League Goals',
      orderCriteria: 'league'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center',
      text: 'DG',
      hoverText: 'Domestic Goals',
      orderCriteria: 'domestic'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center',
      text: 'LG',
      hoverText: 'Champions League Goals',
      orderCriteria: 'champions'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center',
      text: 'P',
      hoverText: 'Total Points',
      orderCriteria: 'points()'
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

  /**
   *
   * @type {object}
   */
  $scope.selectedPlayers = null;

  /**
   * {ng-click} - when manager option changes
   */
  $scope.changeManager = function (selectedManager) {

    $scope.selectedManager = selectedManager;
    $scope.selectedPlayers = selectedManager.players;
    //console.log('$scope.selectedManager', $scope.selectedManager);
    console.log('$scope.selectedPlayers', $scope.selectedPlayers);

  };

  /**
   *
   */
  $scope.addPlayer = function (player) {

    //console.log('addPlayer --> player', player);
    player.managerName = $scope.selectedManager.managerName;
    player.transactionType = 'ADD';
    $scope.openModal(player);

  };

  /**
   *
   */
  $scope.dropPlayer = function (player) {

    //console.log('dropPlayer --> player', player);
    player.managerName = $scope.selectedManager.managerName;
    player.transactionType = 'DROP';
    $scope.openModal(player);

  };

  $scope.transactionPlayerAdded = false;

  $scope.transactionPlayerRemoved = false;

  /**
   *
   */
  $scope.openModal = function (player) {

    var modalInstance = $modal.open({
      templateUrl: './views/modal/transfer-window.html',
      controller: 'transferWindowCtrl',
      resolve: {
        playerObject: function () {
          return player;
        }
      }
    });

    modalInstance.result.then(function (selectedPlayer) {

      if (selectedPlayer.transactionType === 'ADD') {
        $scope.transactionPlayerAdded = true;
        $scope.addedPlayerObject = selectedPlayer;
      } else if (selectedPlayer.transactionType === 'DROP') {
        $scope.transactionPlayerRemoved = true;
        $scope.removePlayerObject = selectedPlayer;
      }
    }, function () {
      console.log('Modal dismissed');
    });

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

    $scope.selectedManager = $scope.allManagers[0];
    $scope.selectedPlayers = $scope.selectedManager.players;

    //makeTransactions();

  };

  $scope.setAllPlayersToActive = function () {

    $scope.allManagers.forEach(function (manager) {
      manager.players.forEach(function (eachPlayer) {
        eachPlayer.status = 'active'
      });
    });

  };

  $scope.makeTransfer = function(playerAdded, playerDropped) {

  };

  $scope.makeTransactions = function () {

    //1. Dan

    var dan = $scope.allManagers[2];

    dan.transactions = [];

    dan.transactions.push({

      drop: {
        id: '281',
        playerName: 'Jonathan BIABIANY',
        league: 'SERIE A',
        teamName: 'PARMA',
        dateOfTransaction: $dateService.transactionDate()
      },
      add: {
        id: '30268',
        playerName: 'Filip DJORDJEVIC',
        league: 'SERIE A',
        teamName: 'LAZIO',
        dateOfTransaction: $dateService.transactionDate()
      }

    });

    dan.players.forEach(function (eachPlayer) {
      if (eachPlayer.id === 281) {
        eachPlayer.status = 'dropped';
        eachPlayer.dateOfTransaction = $dateService.transactionDate()
      }
    });

    dan.players.push({

      id: 30268,
      clGoals: 0,
      domesticGoals: 0,
      eGoals: 0,
      goals: 0,
      leagueGoals: 0,
      league: 'SERI',
      playerName: 'Filip DJORDJEVIC',
      teamName: 'LAZIO',
      status: 'added',
      dateOfTransaction: $dateService.transactionDate()

    });

    console.log('dan', dan);
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
