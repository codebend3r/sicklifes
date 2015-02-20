/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.controller('monthlyWinnersCtrl', function ($scope, $timeout, $managersService, $routeParams, $updateDataUtils, $objectUtils, $arrayFilter, $fireBaseService, localStorageService, $dateService) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  $scope.loading = true;

  $scope.admin = $routeParams.admin;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-3 col-sm-4 col-xs-4',
      text: 'Player'
    },
    {
      columnClass: 'col-md-2 hidden-sm hidden-xs',
      text: 'Opponent'
    },
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center',
      text: 'Goals'
    },
    {
      columnClass: 'col-md-2 col-sm-2 col-xs-3 text-center',
      text: 'Score'
    },
    {
      columnClass: 'col-md-2 col-sm-2 hidden-xs',
      text: 'League'
    },
    {
      columnClass: 'col-md-2 col-sm-2 col-xs-3',
      text: 'Date'
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

  $scope.managersData = [];

  /**
   * {ng-click} - when manager option changes
   */
  $scope.changeManager = function (selectedManager) {

    $scope.manager = selectedManager;
    //$location.url($location.path() + '?team=' + selectedTeam.personName); // route change

  };

  /**
   * {ng-click} - when month option is changed
   */
  $scope.changeMonth = function (month) {
    $scope.selectedMonth = month;
    updateFilter();
  };

  $scope.updateAllManagerData = null;

  /**
   * saves data to firebase
   */
  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.managersData', $scope.managersData);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'monthlyWinnersCtrl',
      _lastSyncedOn: $dateService.syncDate(),
      chester: $scope.managersData[0],
      frank: $scope.managersData[1],
      dan: $scope.managersData[2],
      justin: $scope.managersData[3],
      mike: $scope.managersData[4],
      joe: $scope.managersData[5]
    };

    $fireBaseService.syncManagersData(saveObject);

  };

  ////////////////////////////////////////
  ////////////// private /////////////////
  ////////////////////////////////////////

  /**
   * filters game log by selected month
   */
  var updateFilter = function () {

    $scope.managersData.forEach(function (manager) {

      manager.players.forEach(function (player) {

        manager = $objectUtils.cleanManager(manager, false);
        manager.filteredMonthlyGoalsLog = manager.monthlyGoalsLog.filter($arrayFilter.filterOnMonth.bind($scope, manager, $scope.selectedMonth, player));

      });

    })

  };

  /**
   * call when firebase data has loaded
   * defines $scope.managersData
   * @param data
   */
  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded -- monthlyWinnersCtrl');

    $scope.loading = false;

    $scope.managersData = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    $scope.manager = $scope.managersData[0];

    $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.managersData);

    updateFilter();

    console.log('syncDate allPlayersData:', data.allPlayersData._lastSyncedOn);
    console.log('syncDate leagueData:', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData:', data.managersData._lastSyncedOn);

  };

  /**
   * retrieve data from local storage
   */
  var getFromLocalStorage = function () {

    console.log('firebase unavailable');
    $scope.loading = false;
    var localManagers = localStorageService.get('leagueTeamData');
    console.log('localManagers', localManagers);

  };

  /**
   * init controller
   */
  var init = function () {

    console.log('monthlyWinnersCtrl - init');
    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded, getFromLocalStorage);

  };

  $timeout(init, 250);

});
