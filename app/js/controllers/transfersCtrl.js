/**
 * Created by Bouse on 11/23/2014
 */

sicklifesFantasy.controller('transfersCtrl', function ($scope, $fireBaseService, $apiFactory, $objectUtils, $modal, $arrayMappers, $dateService, $routeParams) {

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
    console.log('$scope.allPlayers', $scope.allPlayers, '|', $scope.allPlayers.length);
    console.log('////////////////////////////////////');

    var allPlayersObject = {
      _syncedFrom: 'transfersCtrl',
      _lastSynedOn: $dateService.syncDate(),
      allPlayers: $scope.allPlayers
    };

    $fireBaseService.syncAllPlayersList(allPlayersObject);

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

    $scope.allPlayers = [];

    // returns a list of promise with the end point for each league
    $apiFactory.listOfPromises(allTeams, function (result) {

      result.forEach(function (leagueData) {

        leagueData.data.forEach(function (teamData) {

          var url = 'http://api.thescore.com/' + leagueData.leagueName + '/teams/' + teamData.id + '/players/?rpp=-1';

          // returns a promise with the end point for each team
          var rosterRequest = $apiFactory.getData({
            endPointURL: url
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

  $scope.addedPlayerImage = '';

  $scope.droppedPlayerImage = '';

  /**
   * whether a player has been added to a roster
   * @type {boolean}
   */
  $scope.transactionPlayerAdded = false;

  /**
   * whether a player has been removed from a roster
   * @type {boolean}
   */
  $scope.transactionPlayerRemoved = false;

  /**
   * saves the added and dropped players to the current manager's roster
   */
  $scope.saveRoster = function () {

    if (!angular.isDefined($scope.selectedManager.transactions)) {
      $scope.selectedManager.transactions = [];
    }

    $scope.selectedManager.transactions.push({

      drop: $scope.droppedPlayerObject,
      add: $scope.addedPlayerObject

    });

    //$scope.droppedPlayerObject = cleanPlayer($scope.droppedPlayerObject);
    //$scope.addedPlayerObject = cleanPlayer($scope.addedPlayerObject);

    // add
    $scope.selectedManager.players.push(cleanPlayer($scope.addedPlayerObject));

    // drop
    $scope.selectedManager.players.forEach(function (eachPlayer) {
      if (eachPlayer.id === $scope.droppedPlayerObject.id) {
        eachPlayer.status = 'dropped';
        eachPlayer.dateOfTransaction = $dateService.transactionDate('11/17/14');
      }
    });

    console.log('///////////////////////////////////////////');
    console.log('$scope.selectedManager', $scope.selectedManager);
    console.log('///////////////////////////////////////////');

  };

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
        console.log('ADDING PLAYER');
        $scope.transactionPlayerAdded = true;
        $scope.addedPlayerObject = $objectUtils.cleanPlayer(selectedPlayer);
        $scope.addedPlayerObject.status = 'added';
        if (angular.isDefined($scope.addedPlayerObject.ownedBy)) delete $scope.addedPlayerObject.ownedBy;

      } else if (selectedPlayer.transactionType === 'DROP') {
        console.log('REMOVING PLAYER');
        $scope.transactionPlayerRemoved = true;
        $scope.droppedPlayerObject = $objectUtils.cleanPlayer(selectedPlayer);
        $scope.droppedPlayerObject.status = 'dropped';
        if (angular.isDefined($scope.droppedPlayerObject.ownedBy)) delete $scope.droppedPlayerObject.ownedBy;

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

  $scope.resetAllPlayers = function () {

    console.log('>> $scope.allManagers', $scope.allManagers);

    $scope.allManagers.forEach(function (manager) {
      /*
       if(angular.isDefined(manager.status)) delete manager.status;

       if (!angular.isDefined(manager.transactions)) {
       manager.transactions = [];
       }

       if (manager.clGoals) delete manager.clGoals;
       if (manager.domesticGoals) delete manager.domesticGoals;
       if (manager.eGoals) delete manager.eGoals;
       if (manager.goals) delete manager.goals;
       if (manager.leagueGoals) delete manager.leagueGoals;
       if (manager.points) delete manager.points;
       */

      if (angular.isDefined(manager.clGoals)) delete manager.clGoals;
      if (angular.isDefined(manager.domesticGoals)) delete manager.domesticGoals;
      if (angular.isDefined(manager.eGoals)) delete manager.eGoals;
      if (angular.isDefined(manager.goals)) delete manager.goals;
      if (angular.isDefined(manager.leagueGoals)) delete manager.leagueGoals;

      //if (manager.domesticGoals) delete manager.domesticGoals;
      //if (manager.eGoals) delete manager.eGoals;
      //if (manager.goals) delete manager.goals;
      //if (manager.leagueGoals) delete manager.leagueGoals;

      //manager.players.forEach(function (eachPlayer) {
        //eachPlayer.status = 'active';
        //eachPlayer.managerName = manager.managerName;
      //});

    });

    console.log('>> $scope.allManagers', $scope.allManagers);

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
