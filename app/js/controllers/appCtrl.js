/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('appCtrl', function ($scope, $rootScope, $fireBaseService, $arrayMappers, $momentService, $location, $objectUtils, $arrayFilter, $textManipulator, $http) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.version = 5.4;

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

        _.each($rootScope.managerData, function (manager) {

          //console.log('--------------------------');
          //console.log('updateAllManagersFilter:', manager.managerName);
          //manager = $objectUtils.managerResetGoalPoints(manager);

          var filteredGames = _.chain(manager.filteredMonthlyGoalsLog)
            .flatten(true)
            .filter($arrayFilter.filterOnMonth.bind($scope, $scope.selectedMonth))
            .value();

          //console.log('filteredGames', filteredGames);

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
       * @description whether data is still loading
       */
      $rootScope.loading = true;

      /**
       * @description if firebase has been initalized
       */
      $rootScope.fireBaseReady = false;

      /**
       * saved reference to firebase data once it's been loaded
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
       * @description if manually adding players to roster
       * @type {boolean}
       */
      $scope.draftMode = $location.search().draftMode;

      /**
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
       * @description populates $scope.managerData && $rootScope.managerData
       * @param data {object}
       */
      $scope.populateManagersData = function (data) {

        var managerData = {
          chester: data.chester,
          frank: data.frank,
          dan: data.dan,
          justin: data.justin,
          mike: data.mike,
          joe: data.joe
        };

        $scope.managerData = managerData;
        $rootScope.managerData = managerData;

        return managerData;

      };

      /**
       * @description defines $scope.selectedManager
       */
      $scope.chooseManager = function (managerId) {
        $rootScope.selectedManager = $scope.managerData[managerId.toLowerCase()];
      };

      /**
       * @description saves current managersData to firebase
       */
      $scope.saveRoster = function () {

        var saveObject = {
          _lastSyncedOn: $momentService.syncDate(),
          data: $rootScope.managerData
        };

        console.log('saveRoster --> saveObject', saveObject);

        //_.each(saveObject.data, function(manager) {
        //  _.each(manager.filteredMonthlyGoalsLog, function(log){
        //    console.log(manager.managerName, '>', log.datePlayed);
        //  });
        //});

        $scope.saveToFireBase(saveObject, 'managersData');

      };

      /////////////////////////////
      // MONTHLY
      /////////////////////////////

      /**
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
       * @description the select box model
       * @type {{monthName: string, range: string[]}}
       */
      $scope.selectedMonth = $scope.allMonths[0];

      /**
       * @description when month option is changed
       */
      $scope.changeMonth = function (month) {
        $scope.selectedMonth = month;
        updateAllManagersFilter();
        $rootScope.$emit('MONTH_CHANGED', month);
      };

      /**
       * sets data in the initialized firebase service
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
       * starts the process of getting data from firebase
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
       * @name saveToIndex
       * @description saves 1 player to allPlayersIndex
       * @param playerId
       * @param player
       */
      $scope.saveToIndex = function (playerId, player) {

        var allPlayers = $rootScope.firebaseData.allPlayersIndex || {};
        allPlayers.data[playerId] = player;
        allPlayers._lastSyncedOn = $momentService.syncDate();

        console.log('saving allPlayersIndex:', _.keys(allPlayers.data).length);

        $scope.saveToFireBase(allPlayers, 'allPlayersIndex');

      };

      /**
       * @name saveTeamToIndex
       * @description pushes an entire team to allPlayersIndex
       * @param teamArray
       */
      $scope.saveTeamToIndex = function (teamArray) {

        var allPlayers = $rootScope.firebaseData.allPlayersIndex || {};
        var teamObj = {};

        _.each(teamArray, function (player) {
          teamObj[player.id] = player;
        });

        //console.log('teamObj', teamObj);
        //console.log('teamObj length:', _.keys(teamObj).length);
        //console.log('BEFORE allPlayers length:', _.keys(allPlayers.data).length);

        var combinedObj = _.defaults(allPlayers.data, teamObj, {});

        //console.log('AFTER allPlayers length:', _.keys(allPlayers.data).length);

        console.log('combinedObj length:', _.keys(combinedObj).length);

        //console.log('allPlayers', allPlayers);
        $scope.saveToFireBase(allPlayers, 'allPlayersIndex');

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
