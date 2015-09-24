/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('monthlyWinnersCtrl', function ($scope, $timeout, $managersService, $stateParams, $rootScope, $updateDataUtils, $objectUtils, $arrayFilter, $fireBaseService, $localStorage, $momentService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $scope.dataKeyName = 'managersData';

      $rootScope.loading = true;

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
       * when month option is changed
       */
      $scope.changeMonth = function (month) {
        $scope.selectedMonth = month;
        updateFilter();
      };

      /**
       *
       * @param selectedManager
       */
      $scope.changeManager = function (selectedManager) {

        $scope.selectedManager = selectedManager;
        $state.go($state.current.name, { managerId: selectedManager.managerName.toLowerCase() });

      };

      /**
       * saves current data to firebase
       */
      $scope.saveRoster = function () {

        _.each($scope.managerData, function (m) {

          _.each(m.players, function (p) {

            if (p.leagueName === 'SERIE A') {
              p.leagueName = 'SERI';
            }

            if (p.leagueName === 'LA LIGA') {
              p.leagueName = 'LIGA';
            }

            //console.log(m.managerName, '|',p.playerName, '|', p.leagueName);

          });

        });

        var saveObject = {
          _lastSyncedOn: $momentService.syncDate(),
          chester: $scope.managerData.chester,
          frank: $scope.managerData.frank,
          dan: $scope.managerData.dan,
          justin: $scope.managerData.justin,
          mike: $scope.managerData.mike,
          joe: $scope.managerData.joe
        };

        console.log('saveObject', saveObject.chester.filteredMonthlyGoalsLog[0]);

        $scope.saveToFireBase(saveObject, $scope.dataKeyName);

      };

      /**
       *
       * @param managerData
       */
      $scope.onManagersRequestFinished = function (managerData) {
        $rootScope.loading = false;
        //$rootScope.loading = false;
        $scope.managerData = $scope.populateManagersData(managerData);
        $scope.chooseManager($stateParams.managerId);
        //$scope.saveRoster();
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
       * callback for when firebase is loaded
       * @param firebaseData {object} - firebase data object
       */
      var firebaseLoaded = function (firebaseData) {

        console.log('///////////////////');
        console.log('FB --> firebaseData.managersData:', firebaseData[$scope.dataKeyName]);
        console.log('///////////////////');

        $rootScope.fireBaseReady = true;

        $scope.managersData = $scope.populateManagersData(firebaseData.managersData);
        console.log('syncDate:', firebaseData[$scope.dataKeyName]._lastSyncedOn);

        if ($scope.checkYesterday(firebaseData[$scope.dataKeyName]._lastSyncedOn)) {

          console.log('-- data is too old --');

          $scope.startFireBase(function () {

            $rootScope.fireBaseReady = true;

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(firebaseData.managersData);

            // define the current manager
            $scope.chooseManager($stateParams.managerId);

            //$scope.selectedManager = $scope.managerData[$stateParams.managerId];

            $updateDataUtils.updateAllManagerData()
              .then(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          $rootScope.loading = false;
          $scope.managerData = $scope.populateManagersData(firebaseData.managersData);
          $scope.chooseManager($stateParams.managerId);
          //$scope.saveRoster();

        }

      };

      /**
       * callback for when local storage exists
       * @param localData {object}
       */
      var loadFromLocal = function (localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('///////////////////');

        console.log('syncDate:', localData._lastSyncedOn);

        if ($scope.checkYesterday(localData._lastSyncedOn)) {

          console.log('-- data is too old --');

          $scope.startFireBase(function (firebaseData) {

            $rootScope.fireBaseReady = true;

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(localData);

            // define the current manager
            $scope.chooseManager($stateParams.managerId);

            //$scope.selectedManager = $scope.managerData[$stateParams.managerId];

            $updateDataUtils.updateAllManagerData()
              .then(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          $scope.startFireBase(function () {

            $rootScope.fireBaseReady = true;
            $rootScope.loading = false;
            $scope.managerData = $scope.populateManagersData(localData);
            $scope.chooseManager($stateParams.managerId);
            //$scope.saveRoster();

          });

        }

      };

      /**
       * init controller
       */
      var init = function () {

        console.log('monthlyWinnersCtrl --> init');

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(firebaseLoaded);

        }

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope);

      };

      init();

    });

})();