/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('appCtrl', function ($scope, $rootScope, $q, $location, $localStorage, apiFactory, $state, fireBaseService, arrayMappers, momentService, objectUtils, arrayFilter, textManipulator, scoringLogic) {

      console.log('--> appCtrl');

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.version = '6.1';

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

        console.log('updateAllManagersFilter');

        _.each($rootScope.managerData.data, function (manager) {

          var points;

          var filteredGames = _.chain(manager.filteredMonthlyGoalsLog)
            .flatten(true)
            .filter(arrayFilter.filterOnMonth.bind($scope, $scope.selectedMonth))
            .value();

          manager = objectUtils.managerResetGoalPoints(manager);

          filteredGames = _.map(filteredGames, function (data) {

            points = scoringLogic.calculatePoints(data.goals, data.leagueSlug);

            data.points = points;

            manager.totalGoals += data.goals;
            manager.totalPoints += data.points;

            if (textManipulator.isDomesticLeague(data.leagueSlug)) {
              manager.domesticGoals += data.goals;
            }

            if (textManipulator.isChampionsLeague(data.leagueSlug)) {
              manager.clGoals += data.goals;
            }

            if (textManipulator.isEuropaLeague(data.leagueSlug)) {
              manager.eGoals += data.goals;
            }

            manager.chartData.push({
              points: manager.totalPoints,
              goals: manager.goals,
              stepPoints: data.points,
              stepGoals: data.goals,
              date: data.datePlayed
            });

            return data;

          });

          _.each(manager.players, function (player) {

            player = objectUtils.playerResetGoalPoints(player);

            _.each(filteredGames, function (data) {
              if (player.playerName === data.playerName) {
                player.goals += data.goals;
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
      $scope.loading = true;

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
      }, function (nv, ov) {
        $scope.admin = angular.isDefined(nv);
      }, true);

      /**
       * @description if admin you can edit information
       * @type {boolean}
       */
      $scope.edit = $location.search().edit;

      /**
       * @name draftMode
       * @description if manually adding players to roster
       * @type {boolean}
       */
      $scope.draftMode = $location.search().draftMode;

      /////////////////////////////
      // ROSTER
      /////////////////////////////

      $scope.managersList = ['Chester', 'Frank', 'Joe', 'Justin', 'Dan', 'Mike'];

      /**
       * @name chooseManager
       * @description defines $scope.selectedManager
       */
      $scope.chooseManager = function (managerId) {
        $rootScope.selectedManager = $rootScope.managerData[managerId.toLowerCase()];
      };

      /**
       * @name saveRoster
       * @description saves current managerData to firebase
       */
      $scope.saveRoster = function (managerData) {

        var gameLogsObject = {};
        var chartsObj = {};
        var managerPlayers = {};
        var index = 0;
        var managersList = [ 'Chester', 'Dan', 'Frank', 'Joe', 'Justin', 'Mike' ];

        _.each(managerData, function(manager, key) {

          manager.managerName = managersList[index];
          index += 1;

          gameLogsObject[key] = {
            filteredMonthlyGoalsLog: manager.filteredMonthlyGoalsLog,
            monthlyGoalsLog: manager.monthlyGoalsLog
          }

          chartsObj[key] = {
            chartData: manager.chartData
          }

          angular.isDefined(manager.filteredMonthlyGoalsLog) && delete manager.filteredMonthlyGoalsLog;
          angular.isDefined(manager.monthlyGoalsLog) && delete manager.monthlyGoalsLog;
          angular.isDefined(manager.chartData) && delete manager.chartData;
          angular.isDefined(manager.gameLogs) && delete manager.gameLogs;

          _.each(manager.players, function(player) {

            player.managerName = manager.managerName;

            angular.isDefined(player.seriGameLog) && delete player.seriGameLog;
            angular.isDefined(player.eplGameLog) && delete player.eplGameLog;
            angular.isDefined(player.ligaGameLog) && delete player.ligaGameLog;
            angular.isDefined(player.chlgGameLog) && delete player.chlgGameLog;
            angular.isDefined(player.euroGameLog) && delete player.euroGameLog;
            angular.isDefined(player.allLeaguesName) && delete player.allLeaguesName;

          });

          managerPlayers[key] = {
            players: manager.players
          }

          angular.isDefined(manager.players) && delete manager.players;

        });

        $scope.saveToFireBase({
          data: managerData,
          _lastSyncedOn: momentService.syncDate(),
        }, 'managerData');

        $scope.saveToFireBase({
          data: chartsObj,
          _lastSyncedOn: momentService.syncDate()
        }, 'charts');

        $scope.saveToFireBase({
          data: gameLogsObject,
          _lastSyncedOn: momentService.syncDate()
        }, 'gameLogs');

        $scope.saveToFireBase({
          data: managerPlayers,
          _lastSyncedOn: momentService.syncDate()
        }, 'managerPlayers');

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
          range: ['December 1 ' + startYear, 'January 1 ' + endYear]
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

      $rootScope.$on('MONTH_CHANGED', function () {
        updateAllManagersFilter();
      });

      /**
       * @name saveToFireBase
       * @description sets data in the initialized firebase service
       * @param saveObject
       * @param dataKey
       */
      $scope.saveToFireBase = function (saveObject, dataKey) {
        if ($rootScope.fireBaseReady) {
          fireBaseService.saveToFireBase(saveObject, dataKey);
        } else {
          $scope.startFireBase($scope.saveToFireBase.bind($scope, saveObject, dataKey));
        }
      };

      /**
       * @name startFireBase
       * @description starts the process of getting data from firebase
       * @param callback
       */
      $scope.startFireBase = function (callback) {
        if (angular.isUndefinedOrNull(callback)) throw new Error('$scope.startFireBase: the callback parameter was not defined');
        if ($rootScope.fireBaseReady) {
          callback($rootScope.firebaseData);
        } else {
          fireBaseService.initialize($scope);
          var firePromise = fireBaseService.getFireBaseData();
          firePromise.then(function (fbData) {
            $rootScope.firebaseData = fbData;
            $rootScope.fireBaseReady = true;
            //$rootScope.lastSyncDate = $rootScope.firebaseData.managerData._lastSyncedOn;
            //$rootScope.source = 'firebase';
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
        allPlayers._lastSyncedOn = momentService.syncDate();

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
       * @name checkForWildCard
       * @description computed function to determine manager wildcard count
       * @param player
       * @param manager
       */
      $scope.checkForWildCard = function (player, manager) {

        // if player is not dropped then count on active roster
        if (player.status !== 'dropped' && angular.isDefined(manager) && (player.playedInChlgGames || player.playedInEuroGames)) {
          if (!player.playedInLigaGames && !player.playedInEPLGames && !player.playedInSeriGames) {
            manager.wildCardCount += 1;
          }
        }

      };

      /**
       * @name lastDays
       * @description
       */
      $scope.lastDays = function (days) {

        var listOfDays = [];
        var today = moment();
        var thePast = today.subtract(days, 'days');
        for (var i = 0; i < days; i++) {
          var newDay = thePast.add(1, 'days');
          listOfDays.push(newDay.format('YYYY/MM/DD'));
        }
        return listOfDays;

      };

      /**
       * @name resetAllPlayers
       * @description clears all players from every roster
       */
      $scope.resetAllPlayers = function () {

        _.each($rootScope.managerData, function (manager) {

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

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

        console.log('state changed start');

        $scope.loading = true;

        if (toState.name === 'leagues') {
          if (!_.has(toParams, 'leagueName') || toParams.leagueName === '') {
            toParams.leagueName = 'epl';
          }
          //console.log('go to league', toParams.leagueName);
          $state.go('leagues.tables', {leagueName: toParams.leagueName});
        } else if (toState.name === 'standings') {
          console.log('toState', toState);
          console.log('toParams:', toParams);
          //if (!_.has(toParams, 'leagueName') || toParams.leagueName === '') {
          //  toParams.leagueName = 'epl';
          //}
          //$state.go('standings.tables', {leagueName: toParams.leagueName});
        }
      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        console.log('state changed success');
        $scope.loading = false;

      });


    });

})();
