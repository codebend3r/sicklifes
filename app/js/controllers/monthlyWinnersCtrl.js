/**
 * Updated by Bouse on 12/06/2014
 */

angular.module('sicklifes')

  .controller('monthlyWinnersCtrl', function ($scope, $timeout, $managersService, $stateParams, $rootScope, $updateDataUtils, $objectUtils, $arrayFilter, $fireBaseService, $localStorage, $momentService) {

    var dataKeyName = 'managersData';

    ////////////////////////////////////////
    /////////////// public /////////////////
    ////////////////////////////////////////

    /**
     * if data is still loading
     */
    $scope.loading = true;

    /**
     * route param
     * @type {boolean}
     */
    $scope.admin = $stateParams.admin;

    var startYear = '2015';
    var endYear = '2016';

    /**
     * table headers
     */
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
        range: ['August 1 ' + startYear, 'June 30 ' + endYear]
      },
      {
        monthName: 'August ' + startYear,
        range: ['August 1 ' + startYear, 'August 31 ' + startYear]
      },
      {
        monthName: 'September ' + startYear,
        range: ['September 1 ' + startYear, 'September 30 ' + startYear]
      },
      {
        monthName: 'October ' + startYear,
        range: ['October 1 ' + startYear, 'October 31 ' + startYear]
      },
      {
        monthName: 'November ' + startYear,
        range: ['November 1 ' + startYear, 'November 30 ' + startYear]
      },
      {
        monthName: 'December ' + startYear,
        range: ['December 1 ' + startYear, 'December 31 ' + startYear]
      },
      {
        monthName: 'January ' + endYear,
        range: ['January 1 ' + endYear, 'January 31 ' + endYear]
      },
      {
        monthName: 'February ' + endYear,
        range: ['February 1 ' + endYear, 'February 28 ' + endYear]
      },
      {
        monthName: 'March ' + endYear,
        range: ['March 1 ' + endYear, 'March 31 ' + endYear]
      },
      {
        monthName: 'April ' + endYear,
        range: ['April 1 ' + endYear, 'April 30 ' + endYear]
      },
      {
        monthName: 'May ' + endYear,
        range: ['May 1 ' + endYear, 'May 31 ' + endYear]
      },
      {
        monthName: 'June ' + endYear,
        range: ['June 1 ' + endYear, 'June 30 ' + endYear]
      }
    ];

    /**
     * the select box model
     * @type {{monthName: string, range: string[]}}
     */
    $scope.selectedMonth = $scope.allMonths[0];

    /**
     *
     * @type {Array}
     */
    $scope.managersData = [];

    /**
     * when manager option changes
     */
    $scope.changeManager = function (selectedManager) {

      $scope.manager = selectedManager;
      //$location.url($location.path() + '?team=' + selectedTeam.personName); // route change

    };

    /**
     * when month option is changed
     */
    $scope.changeMonth = function (month) {
      $scope.selectedMonth = month;
      updateFilter();
    };

    /**
     *
     * @type {null}
     */
    $scope.updateAllManagerData = null;

    /**
     * saves data to firebase
     */
    $scope.saveToFireBase = function () {

      console.log('monthlyWinnersCtrl --> saveToFireBase');

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

      console.log('monthlyWinnersCtrl --> updateFilter');

      _.each($scope.managersData, function (manager) {

        _.each(manager.players, function (player) {

          manager = $objectUtils.cleanManager(manager, false);
          manager.filteredMonthlyGoalsLog = _.filter(manager.monthlyGoalsLog, $arrayFilter.filterOnMonth.bind($scope, manager, $scope.selectedMonth, player));

        });

      });

    };

    /**
     * call when firebase data has loaded
     * defines $scope.managersData
     * @param data
     */
    var fireBaseLoaded = function (firebaseData) {

      console.log('///////////////////');
      console.log('FB --> firebaseData.managersData:', firebaseData[dataKeyName]);
      console.log('///////////////////');

      $scope.loading = false;

      $scope.managersData = [
        firebaseData.managersData.chester,
        firebaseData.managersData.frank,
        firebaseData.managersData.dan,
        firebaseData.managersData.justin,
        firebaseData.managersData.mike,
        firebaseData.managersData.joe
      ];

      $scope.manager = $scope.managersData[0];

      $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.managersData);

      updateFilter();

    };

    /**
     * retrieve data from local storage
     */
    var loadFromLocal = function (localData) {

      console.log('///////////////////');
      console.log('LOCAL --> localData:', localData);
      console.log('///////////////////');

      $scope.loading = false;

      $scope.managersData = [
        localData.chester,
        localData.frank,
        localData.dan,
        localData.justin,
        localData.mike,
        localData.joe
      ];

      $scope.manager = $scope.managersData[0];

      $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.managersData);

      updateFilter();

    };

    /**
     * starts the process of getting data from firebase
     * @param callback
     */
    var startFireBase = function (callback) {

      console.log('--  firebase started --');
      if ($scope.fireBaseReady) {
        console.log('firebase previously loaded');
        callback();
      } else {
        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(callback);
      }

    };

    /**
     * init controller
     */
    var init = function () {

     console.log('monthlyWinnersCtrl --> init');

     if (angular.isDefined($rootScope[dataKeyName])) {

       console.log('load from $rootScope');
       loadFromLocal($rootScope[dataKeyName]);

     } else if (angular.isDefined($localStorage[dataKeyName])) {

       console.log('load from local storage');
       loadFromLocal($localStorage[dataKeyName]);

     } else {

       console.log('load from firebase');
       startFireBase(fireBaseLoaded);

     }

    };

    init();

  });
