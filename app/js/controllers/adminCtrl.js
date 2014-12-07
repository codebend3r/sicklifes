/**
 * Updated by Bouse on 12/06/2014
 */


sicklifesFantasy.controller('adminCtrl', function ($scope, localStorageService, $fireBaseService, $routeParams, $apiFactory, $updateDataUtils, $dateService, $managersService) {

  /**
   * TODO
   */
  $scope.loading = true;

  /**
   * TODO
   */
  $scope.tableHeader = [
    {
      columnClass: 'col-md-3 col-sm-3 col-xs-4',
      text: 'Player',
      hoverText: 'Player',
      orderCriteria: 'playerName'
    },
    {
      columnClass: 'col-md-2 col-sm-3 col-xs-4',
      text: 'Team',
      hoverText: 'Team',
      orderCriteria: 'teamName'
    },
    {
      columnClass: 'col-md-2 col-sm-2 hidden-xs',
      text: 'League',
      hoverText: 'League',
      orderCriteria: 'leagueName'
    },
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center',
      text: 'TG',
      hoverText: 'Total Goals',
      orderCriteria: 'goals'
    },
    {
      columnClass: 'col-md-1 hidden-sm hidden-xs text-center',
      text: 'DG',
      hoverText: 'Domestic Goals',
      orderCriteria: 'domesticGoals'
    },
    {
      columnClass: 'col-md-1 hidden-sm hidden-xs text-center',
      text: 'CLG',
      hoverText: 'Champions League Goals',
      orderCriteria: 'clGoals'
    },
    {
      columnClass: 'col-md-1 hidden-sm hidden-xs text-center',
      text: 'ELG',
      hoverText: 'Europa League Goals',
      orderCriteria: 'eGoals'
    },
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center',
      text: 'TP',
      hoverText: 'Total Points',
      orderCriteria: 'points()'
    }
  ];
  
  /**
   * all months dropdown options
   * @type {{monthName: string, range: string[]}[]}
   */
  $scope.allMonths = [
    {
      monthName: 'All Months',
      range: ['August 1 2014', 'March 31 2015']
    },
    {
      monthName: 'August 2014',
      range: ['August 1 2014', 'August 31 2014']
    },
    {
      monthName: 'September 2014',
      range: ['September 1 2014', 'September 30 2014']
    },
    {
      monthName: 'October 2014',
      range: ['October 1 2014', 'October 31 2014']
    },
    {
      monthName: 'November 2014',
      range: ['November 1 2014', 'November 30 2014']
    },
    {
      monthName: 'December 2014',
      range: ['December 1 2014', 'December 31 2014']
    },
    {
      monthName: 'January 2015',
      range: ['January 1 2015', 'January 31 2015']
    },
    {
      monthName: 'February 2015',
      range: ['February 1 2015', 'February 28 2015']
    },
    {
      monthName: 'March 2015',
      range: ['March 1 2015', 'March 31 2015']
    },
    {
      monthName: 'April 2015',
      range: ['April 1 2015', 'April 30 2015']
    }
  ];

  $scope.selectedMonth = $scope.allMonths[0];

  /**
   * saves data to firebase
   */
  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'adminCtrl',
      _lastSyncedOn: $dateService.syncDate(),
      chester: $scope.allManagers[0],
      frank: $scope.allManagers[1],
      dan: $scope.allManagers[2],
      justin: $scope.allManagers[3],
      mike: $scope.allManagers[4],
      joe: $scope.allManagers[5]
    };

    $fireBaseService.syncLeagueTeamData(saveObject);

  };

  /**
   *
   */
  $scope.resetToDefault = function() {
    
    $scope.allManagers = $managersService.getAllPlayers();
    
    console.log('////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('////////////////////////////////////');
    
  };

  $scope.allPlayers = [];

  $scope.updatePlayerPoolData = null;

  $scope.updateAllManagerData = null;

  ////////////////////////////////////
  ////////////////////////////////////
  ////////////////////////////////////

  var chooseTeam = function () {

    if ($routeParams.manager) {
      $scope.allManagers.forEach(function (manager) {
        if (manager.managerName === $routeParams.manager) {
          $scope.selectedManager = manager;
        }
      });
    } else {
      $scope.selectedManager = $scope.allManagers[0];
    }

  };

  /**
   *
   * @type {{}}
   */
  var allLeaguesObj = {};

  /**
   * call when firebase data has loaded
   * defines $scope.allManagers
   * @param data
   */
  var fireBaseLoaded = function (data) {

    $scope.loading = false;

    $scope.allManagers = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    $scope.updatePlayerPoolData = $updateDataUtils.updatePlayerPoolData.bind($scope, $scope.allPlayers);

    $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.allManagers);

    chooseTeam();

    console.log('syncDate allPlayersData', data.allPlayersData._lastSynedOn);
    console.log('syncDate leagueData', data.leagueData._lastSynedOn);
    console.log('syncDate managersData', data.managersData._lastSyncedOn);
    console.log('$scope.allManagers', $scope.allManagers);

  };

  /**
   * init function
   */
  var init = function () {

    $fireBaseService.initialize();
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded);

  };

  /**
   * all requests complete
   */
  var allRequestComplete = function () {

    $scope.loading = false;
    $scope.populateTable();

  };

  init();

});




