/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('appCtrl', function ($scope, $rootScope, $fireBaseService, $arrayMappers, $momentService, $location, $objectUtils, $arrayFilter, $textManipulator) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.version = 5.7;

      /**
       * @description starting year
       */
      var startYear = '2015';

      /**
       * @description ending year
       */
      var endYear = '2016';

      /**
       * @description filters game log by selected month for all managers
       */
      var updateAllManagersFilter = function () {

        _.each($rootScope.managersData.data, function (manager) {

          //manager = $objectUtils.managerResetGoalPoints(manager);

          var filteredGames = _.chain(manager.filteredMonthlyGoalsLog)
            .flatten(true)
            .filter($arrayFilter.filterOnMonth.bind($scope, $scope.selectedMonth))
            .value();

          manager = $objectUtils.managerResetGoalPoints(manager);

          _.map(filteredGames, function (data) {

            manager.totalGoals += data.goalsScored;
            manager.totalPoints += data.points;

            if ($textManipulator.isDomesticLeague(data.leagueSlug)) {
              manager.domesticGoals += data.goalsScored;
            } else if ($textManipulator.isChampionsLeague(data.leagueSlug)) {
              manager.clGoals += data.goalsScored;
            } else if ($textManipulator.isEuropaLeague(data.leagueSlug)) {
              manager.eGoals += data.goalsScored;
            }

            //console.log(manager.managerName, 'totalPoints', manager.totalPoints);

            manager.chartData.push({
              points: manager.totalPoints,
              goals: manager.goalsScored,
              stepPoints: data.points,
              stepGoals: data.goalsScored,
              date: data.datePlayed
            });

          });

          _.each(manager.players, function (player) {

            player = $objectUtils.playerResetGoalPoints(player);

            _.each(filteredGames, function (data) {
              if (player.playerName === data.playerName) {
                player.goals += data.goalsScored;
                player.points += data.points;
              }
            });

          });

        });

      };

      /*user.getCurrent().then(function (currentUser) {
       //console.log('currentUser:', currentUser);
       $rootScope.user = currentUser;
       console.log('WELCOME', $rootScope.user.first_name);
       //$scope.user = user;
       });*/

      /**
       * @name loading
       * @description whether data is still loading
       */
      $rootScope.loading = true;

      /**
       * @name fireBaseReady
       * @description if firebase has been initalized
       */
      $rootScope.fireBaseReady = false;

      /**
       * @name firebaseData
       * @description saved reference to firebase data once it's been loaded
       */
      $rootScope.firebaseData = null;

      /**
       * @description if admin buttons will show
       * @type {boolean}
       */
      $scope.admin = $location.search().admin;

      $scope.$watch(function () {
        return $location.search().admin;
      }, function (newValue, oldValue) {
        //console.log(newValue, oldValue);
        //$scope.admin = newValue;
      });

      /**
       * @name draftMode
       * @description if manually adding players to roster
       * @type {boolean}
       */
      $scope.draftMode = $location.search().draftMode;

      /**
       * @name dataKeyName
       * @description key name
       */
      $scope.dataKeyName = '';

      /**
       *
       */
      $scope.isActive = function (title) {
        console.log('title', title);
        return false;
      };

      /////////////////////////////
      // ROSTER
      /////////////////////////////

      /**
       * @name chooseManager
       * @description defines $scope.selectedManager
       */
      $scope.chooseManager = function (managerId) {
        $rootScope.selectedManager = $rootScope.managersData[managerId.toLowerCase()];
      };

      /**
       * @name saveRoster
       * @description saves current managersData to firebase
       */
      $scope.saveRoster = function () {

        var saveObject = {
          _lastSyncedOn: $momentService.syncDate(),
          data: $rootScope.managersData.data
        };

        console.log('saveObject:', saveObject);

        $scope.saveToFireBase(saveObject, 'managersData');

      };

      /////////////////////////////
      // MONTHLY
      /////////////////////////////

      /**
       * @name allMonths
       * @description all months dropdown options
       * @type {{monthName: string, range: string[]}[]}
       */
      $scope.allMonths = [
        {
          monthName: 'All Months',
          range: ['August 1 ' + startYear, 'June 30 ' + endYear]
        },
        {
          monthName: 'August ' + startYear,
          range: ['August 1 ' + startYear, 'September 1 ' + startYear]
        },
        {
          monthName: 'September ' + startYear,
          range: ['September 1 ' + startYear, 'October 1 ' + startYear]
        },
        {
          monthName: 'October ' + startYear,
          range: ['October 1 ' + startYear, 'November 1 ' + startYear]
        },
        {
          monthName: 'November ' + startYear,
          range: ['November 1 ' + startYear, 'December 1 ' + startYear]
        },
        {
          monthName: 'December ' + startYear,
          range: ['December 1 ' + startYear, 'January 1 ' + startYear]
        },
        {
          monthName: 'January ' + endYear,
          range: ['January 1 ' + endYear, 'February 1 ' + endYear]
        },
        {
          monthName: 'February ' + endYear,
          range: ['February 1 ' + endYear, 'March 1 ' + endYear]
        },
        {
          monthName: 'March ' + endYear,
          range: ['March 1 ' + endYear, 'April 1 ' + endYear]
        },
        {
          monthName: 'April ' + endYear,
          range: ['April 1 ' + endYear, 'May 1 ' + endYear]
        },
        {
          monthName: 'May ' + endYear,
          range: ['May 1 ' + endYear, 'June 1 ' + endYear]
        },
        {
          monthName: 'June ' + endYear,
          range: ['June 1 ' + endYear, 'July 1  ' + endYear]
        }
      ];

      /**
       * @name selectedMonth
       * @description the select box model
       * @type {{monthName: string, range: string[]}}
       */
      $scope.selectedMonth = $scope.allMonths[0];

      /**
       * @name changeMonth
       * @description when month option is changed
       */
      $scope.changeMonth = function (month) {
        $scope.selectedMonth = month;
        $rootScope.$emit('MONTH_CHANGED', month);
      };

      $rootScope.$on('MONTH_CHANGED', function() {
        updateAllManagersFilter();
      });

      /**
       * @description sets data in the initialized firebase service
       * @param saveObject
       * @param dataKey
       */
      $scope.saveToFireBase = function (saveObject, dataKey) {
        if ($rootScope.fireBaseReady) {
          $fireBaseService.saveToFireBase(saveObject, dataKey);
        } else {
          $scope.startFireBase($scope.saveToFireBase.bind($scope, saveObject, dataKey));
        }
      };

      /**
       * @description starts the process of getting data from firebase
       * @param callback
       */
      $scope.startFireBase = function (callback) {
        if (angular.isUndefinedOrNull(callback)) throw new Error('$scope.startFireBase: the callback parameter was not defined');
        if ($rootScope.fireBaseReady) {
          callback($rootScope.firebaseData);
        } else {
          $fireBaseService.initialize($scope);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.then(function (fbData) {
            $rootScope.firebaseData = fbData;
            $rootScope.fireBaseReady = true;
            $rootScope.lastSyncDate = $rootScope.firebaseData.managersData._lastSyncedOn;
            $rootScope.source = 'firebase';
            callback(fbData);
          });
        }
      };

      /**
       * @name saveToPlayerIndex
       * @description saves 1 player to allPlayersIndex
       * @param playerId
       * @param player
       */
      $scope.saveToPlayerIndex = function (playerId, player) {

        var allPlayers = $rootScope.allPlayersIndex || {};
        allPlayers.data[playerId] = player;
        allPlayers._lastSyncedOn = $momentService.syncDate();

        $scope.saveToFireBase(allPlayers, 'allPlayersIndex');

      };

      /**
       * @name saveTeamToPlayerIndex
       * @description pushes an entire team to allPlayersIndex
       * @param teamArray
       */
      $scope.saveTeamToPlayerIndex = function (teamArray) {

        var allPlayers = $rootScope.allPlayersIndex || {};
        var teamObj = {};

        _.each(teamArray, function (player) {
          teamObj[player.id] = player;
        });

        var combinedPlayers = _.defaults({}, allPlayers, teamObj);

        $scope.saveToFireBase(combinedPlayers, 'allPlayersIndex');

      };

      /**
       * clears all players from every roster
       */
      $scope.resetAllPlayers = function () {

        _.each($rootScope.managersData, function (manager) {

          manager.players = {};
          manager.chlgCount = 0;
          manager.clGoals = 0;
          manager.domesticGoals = 0;
          manager.eGoals = 0;
          manager.eplCount = 0;
          manager.euroCount = 0;
          manager.filteredMonthlyGoalsLog = [];
          manager.ligaCount = 0;
          manager.monthlyGoalsLog = [];
          manager.seriCount = 0;
          manager.totalGoals = 0;
          manager.totalPoints = 0;
          manager.transactions = [];
          manager.wildCardCount = 0;

        });

      };


    });

})();
