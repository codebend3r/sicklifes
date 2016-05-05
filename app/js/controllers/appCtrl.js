/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('appCtrl', function ($scope, $rootScope, $log, $q, $location, $localStorage, $moment, apiFactory, $state, fireBaseService, arrayMappers, momentService, objectUtils, arrayFilter, textManipulator, scoringLogic) {

      // public

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
      }, function (nv) {
        $scope.admin = angular.isDefined(nv);
      }, true);

      /**
       * @description if admin you can edit information
       * @type {boolean}
       */
      $rootScope.edit = $location.search().edit;

      $rootScope.$watch(function () {
        return $location.search().edit;
      }, function (nv) {
        $rootScope.edit = angular.isDefined(nv) && !!nv;
      }, true);

      /**
       * @name draftMode
       * @description if manually adding players to roster
       * @type {boolean}
       */
      $scope.draftMode = $location.search().draftMode;

      // $scope.managersList = ['chester', 'frank', 'joe', 'justin', 'dan', 'mike'];

      /**
       * @name chooseManager
       * @description defines $scope.selectedManager
       */
      $scope.chooseManager = function (managerId) {
        $rootScope.selectedManager = $rootScope.managerData[managerId.toLowerCase()];
      };

      /**
       * @name saveCoreData
       * @description saves current passed in object to firebase as managerCore
       * @param {object} coreData - and object (not array) containing information to be saved
       * @returns {void}
       */
      $scope.saveCoreData = function (coreData) {

        $log.debug('//////////////////////////////');
        $log.debug('SAVING CORE DATA');
        $log.debug('//////////////////////////////');

        if (Array.isArray(coreData)) {
          $log.warn('coreData can not be an array');
          return false;
        }

        $log.debug('===============================');
        $log.debug('coreData', coreData);
        $log.debug('===============================');

        if (_.hasDeepProperty(coreData, 'managerName') && _.hasDeepProperty(coreData, 'players')) {

          _.each(coreData, function(m) {
            if (_.keys(m.players).length < 26) {
              $log.warn('does NOT have at least 26 players', _.keys(m.players).length);
              debugger;
              return false;
            }
          });

          var hasPlayer = _.allHaveProperty(coreData, 'player');

          if (hasPlayer) {
            $log.debug('all players have \'player\' property');
          } else {
            $log.debug('all players DO NOT have \'player\' property');
            debugger;
            return false;
          }

          var hasPlayerId = _.allHaveProperty(coreData, 'player.id');

          if (hasPlayerId) {
            $log.debug('all players have \'player.id\' property');
          } else {
            $log.debug('all players DO NOT have \'player.id\' property');
            debugger;
            return false;
          }

          var hasPlayerName = _.allHaveProperty(coreData, 'player.name');

          if (hasPlayerName) {
            $log.debug('all players have \'player.name\' property');
          } else {
            $log.debug('all players DO NOT have \'player.name\' property');
            debugger;
            return false;
          }

          var hasStatus = _.allHaveProperty(coreData, 'player.status');

          if (hasStatus) {
            $log.debug('all players have \'player.status\' property');
          } else {
            $log.debug('all players DO NOT have \'player.status\' property');
            debugger;
            return false;
          }

          var hasImage = _.allHaveProperty(coreData, 'player.image');

          if (hasImage) {
            $log.debug('all players have \'player.image\' property');
          } else {
            $log.debug('all players DO NOT have \'player.image\' property');
            debugger;
            return false;
          }

          var hasPickNumber = _.allHaveProperty(coreData, 'player.pickNumber');

          if (hasPickNumber) {
            $log.debug('all players have \'player.pickNumber\' property');
          } else {
            $log.debug('all players DO NOT have \'player.pickNumber\' property');
            debugger;
            return false;
          }

          var hasTeam = _.allHaveProperty(coreData, 'team');

          if (hasTeam) {
            $log.debug('all players have \'team\' property');
          } else {
            $log.debug('all players DO NOT have \'team\' property');
            debugger;
            return false;
          }

          var hasTeamId = _.allHaveProperty(coreData, 'team.id');

          if (hasTeamId) {
            $log.debug('all players have \'team.id\' property');
          } else {
            $log.debug('all players DO NOT have \'team.id\' property');
            debugger;
            return false;
          }

          var hasTeamName = _.allHaveProperty(coreData, 'team.name');

          if (hasTeamName) {
            $log.debug('all players have \'team.name\' property');
          } else {
            $log.debug('all players DO NOT have \'team.name\' property');
            debugger;
            return false;
          }

          var hasTeamLogo = _.allHaveProperty(coreData, 'team.logo');

          if (hasTeamLogo) {
            $log.debug('all players have \'team.logo\' property');
          } else {
            $log.debug('all players DO NOT have \'team.logo\' property');
            debugger;
            return false;
          }

          var hasManager = _.allHaveProperty(coreData, 'manager');

          if (hasManager) {
            $log.debug('all players have \'manager\' property');
          } else {
            $log.debug('all players DO NOT have \'manager\' property');
            debugger;
            return false;
          }

          var hasManagerName = _.allHaveProperty(coreData, 'manager.name');

          if (hasManagerName) {
            $log.debug('all players have \'manager.name\' property');
          } else {
            $log.debug('all players DO NOT have \'manager.name\' property');
            debugger;
            return false;
          }

          var hasLeague = _.allHaveProperty(coreData, 'league');

          if (hasLeague) {
            $log.debug('all players have \'league\' property');
          } else {
            $log.debug('all players DO NOT have \'league\' property');
            debugger;
            return false;
          }

          var hasLeagueName = _.allHaveProperty(coreData, 'league.name');

          if (hasLeagueName) {
            $log.debug('all players have \'league.name\' property');
          } else {
            $log.debug('all players DO NOT have \'league.name\' property');
            debugger;
            return false;
          }

          var hasLeagueSlugs = _.allHaveProperty(coreData, 'league.slugs');

          if (hasLeagueSlugs) {
            $log.debug('all players have \'league.slugs\' property');
          } else {
            $log.debug('all players DO NOT have \'league.slugs\' property');
            debugger;
            return false;
          }

          var hasActive = _.allHaveProperty(coreData, 'active');

          if (hasActive) {
            $log.debug('all players have \'active\' property');
          } else {
            $log.debug('all players DO NOT have \'active\' property');
            debugger;
            return false;
          }


          var hasDateOfTransaction = _.allHaveProperty(coreData, 'dateOfTransaction');

          if (hasDateOfTransaction) {
            $log.debug('all players have \'dateOfTransaction\' property');
          } else {
            $log.debug('all players DO NOT have \'dateOfTransaction\' property');
            debugger;
            return false;
          }

          // var hasTransactions = _.allHaveProperty(coreData, 'transactions');
          //
          // if (hasTransactions) {
          //   $log.debug('all players have \'transactions\' property');
          // } else {
          //   $log.debug('all players DO NOT have \'transactions\' property');
          //   debugger;
          //   return false;
          // }

        } else {
          $log.debug('coreData test failed');
          return false;
        }

        //////////////////////////////////

        if (_.keys(coreData).length === 6) {
          $log.debug('has 6 managers');
        } else {
          $log.debug('does NOT have 6 managers:', _.keys(coreData).length);
        }

        if (_.keys(coreData) === ['chester', 'dan', 'frank', 'joe', 'justin', 'mike']) {
          $log.debug('has exact managers', ['chester', 'dan', 'frank', 'joe', 'justin', 'mike']);
        } else {
          $log.debug('does NOT have exact managers:', _.keys(coreData));
        }

        $scope.saveToFireBase({
          data: coreData,
          _lastSyncedOn: momentService.syncDate()
        }, 'managerCore');

        $scope.hideSpinner();

      };

      /**
       * @name saveRoster
       * @description
       */
      $scope.saveRoster = function (managerData) {

        $log.debug('//////////////////////////////');
        $log.debug('SAVING MANAGERS DATA', managerData);
        $log.debug('//////////////////////////////');

        if (Array.isArray(managerData)) {
          $log.warn('managerData can not be an array');
          return false;
        }

        var managerCore = {};
        var gameLogs = {};
        var charts = {};
        var players = {};
        var playersGameLogs = {};
        var index = 0;

        _.each(managerData, function (manager, key) {

          manager.managerName = key;
          index += 1;

          managerCore[key] = {
            managerName: key.capitalize(),
            players: {}
          };

          players[key] = {
            managerName: key.capitalize(),
            players: _.object(_.map(manager.players, function(p, key) {
              return [key, {
                player: p.player,
                team: p.team,
                league: p.league,
                manager: p.manager,
                stats: p.stats,
                bio: p.bio,
                activeLeagues: p.activeLeagues,
                active: !angular.isUndefinedOrNull(p.active) ? p.active === false : false,
                dateOfTransaction: p.dateOfTransaction
              }];
            }))
          };

          playersGameLogs[key] = {
            managerName: key.capitalize(),
            players: _.object(_.map(manager.players, function(p, key) {
              $log.debug('player game logs', p.gameLogs);
              return [key, {
                gameLogs: p.gameLogs
              }];
            }))
          };

          gameLogs[key] = {
            managerName: key.capitalize(),
            filteredMonthlyGoalsLog: manager.filteredMonthlyGoalsLog,
            monthlyGoalsLog: manager.monthlyGoalsLog
          };

          charts[key] = {
            managerName: key.capitalize(),
            chartData: manager.chartData
          };

        });

        //////////////////////////////////

        if (_.hasDeepProperty(gameLogs, 'managerName') && _.hasDeepProperty(gameLogs, 'filteredMonthlyGoalsLog') && _.hasDeepProperty(gameLogs, 'monthlyGoalsLog')) {
          $log.debug('gameLogs test passsed');
        } else {
          $log.debug('gameLogs test failed');
          return false;
        }

        if (_.hasDeepProperty(charts, 'managerName') && _.hasDeepProperty(charts, 'chartData')) {
          $log.debug('charts test passsed');
        } else {
          $log.debug('charts test failed');
          return false;
        }

        ////////////////////////////////

        if (_.hasDeepProperty(players, 'managerName') && _.hasDeepProperty(players, 'players')) {

          var hasPlayer = _.allHaveProperty(players, 'player');

          if (hasPlayer) {
            $log.debug('all players have \'player\' property');
          } else {
            $log.debug('all players DO NOT have \'player\' property');
            debugger;
            return false;
          }

          var hasPlayerId = _.allHaveProperty(players, 'player.id');

          if (hasPlayerId) {
            $log.debug('all players have \'player.id\' property');
          } else {
            $log.debug('all players DO NOT have \'player.id\' property');
            debugger;
            return false;
          }

          var hasPlayerName = _.allHaveProperty(players, 'player.name');

          if (hasPlayerName) {
            $log.debug('all players have \'player.name\' property');
          } else {
            $log.debug('all players DO NOT have \'player.name\' property');
            debugger;
            return false;
          }

          var hasStatus = _.allHaveProperty(players, 'player.status');

          if (hasStatus) {
            $log.debug('all players have \'player.status\' property');
          } else {
            $log.debug('all players DO NOT have \'player.status\' property');
            debugger;
            return false;
          }

          var hasImage = _.allHaveProperty(players, 'player.image');

          if (hasImage) {
            $log.debug('all players have \'player.image\' property');
          } else {
            $log.debug('all players DO NOT have \'player.image\' property');
            debugger;
            return false;
          }

          var hasPickNumber = _.allHaveProperty(players, 'player.pickNumber');

          if (hasPickNumber) {
            $log.debug('all players have \'player.pickNumber\' property');
          } else {
            $log.debug('all players DO NOT have \'player.pickNumber\' property');
            debugger;
            return false;
          }

          var hasBio = _.allHaveProperty(players, 'bio');

          if (hasBio) {
            $log.debug('all players have \'bio\' property');
          } else {
            $log.debug('all players DO NOT have \'bio\' property');
            debugger;
            return false;
          }

          var hasTeam = _.allHaveProperty(players, 'team');

          if (hasTeam) {
            $log.debug('all players have \'team\' property');
          } else {
            $log.debug('all players DO NOT have \'team\' property');
            debugger;
            return false;
          }

          var hasTeamId = _.allHaveProperty(players, 'team.id');

          if (hasTeamId) {
            $log.debug('all players have \'team.id\' property');
          } else {
            $log.debug('all players DO NOT have \'team.id\' property');
            debugger;
            return false;
          }

          var hasTeamName = _.allHaveProperty(players, 'team.name');

          if (hasTeamName) {
            $log.debug('all players have \'team.name\' property');
          } else {
            $log.debug('all players DO NOT have \'team.name\' property');
            debugger;
            return false;
          }

          var hasTeamLogo = _.allHaveProperty(players, 'team.logo');

          if (hasTeamLogo) {
            $log.debug('all players have \'team.logo\' property');
          } else {
            $log.debug('all players DO NOT have \'team.logo\' property');
            debugger;
            return false;
          }

          var hasManager = _.allHaveProperty(players, 'manager');

          if (hasManager) {
            $log.debug('all players have \'manager\' property');
          } else {
            $log.debug('all players DO NOT have \'manager\' property');
            debugger;
            return false;
          }

          var hasManagerName = _.allHaveProperty(players, 'manager.name');

          if (hasManagerName) {
            $log.debug('all players have \'manager.name\' property');
          } else {
            $log.debug('all players DO NOT have \'manager.name\' property');
            debugger;
            return false;
          }

          var hasLeague = _.allHaveProperty(players, 'league');

          if (hasLeague) {
            $log.debug('all players have \'league\' property');
          } else {
            $log.debug('all players DO NOT have \'league\' property');
            debugger;
            return false;
          }

          var hasLeagueName = _.allHaveProperty(players, 'league.name');

          if (hasLeagueName) {
            $log.debug('all players have \'league.name\' property');
          } else {
            $log.debug('all players DO NOT have \'league.name\' property');
            debugger;
            return false;
          }

          var hasLeagueSlugs = _.allHaveProperty(players, 'league.slugs');

          if (hasLeagueSlugs) {
            $log.debug('all players have \'league.slugs\' property');
          } else {
            $log.debug('all players DO NOT have \'league.slugs\' property');
            debugger;
            return false;
          }

          var hasActive = _.allHaveProperty(players, 'active');

          if (hasActive) {
            $log.debug('all players have \'active\' property');
          } else {
            $log.debug('all players DO NOT have \'active\' property');
            debugger;
            return false;
          }


          var hasDateOfTransaction = _.allHaveProperty(players, 'dateOfTransaction');

          if (hasDateOfTransaction) {
            $log.debug('all players have \'dateOfTransaction\' property');
          } else {
            $log.debug('all players DO NOT have \'dateOfTransaction\' property');
            debugger;
            return false;
          }

        }

        ///////////////////////////////////////

        if (_.hasDeepProperty(playersGameLogs, 'managerName') && _.hasDeepProperty(playersGameLogs, 'players')) {

          var hasGameLogs = _.allHaveProperty(playersGameLogs, 'gameLogs');

          if (hasGameLogs) {
            $log.debug('all players have \'gameLogs\' property');
          } else {
            $log.debug('all players DO NOT have \'gameLogs\' property');
            debugger;
            return false;
          }

        };

        $log.debug('===============================');
        $log.debug('gameLogs:', gameLogs);
        $log.debug('charts:', charts);
        $log.debug('players:', players);
        $log.debug('playersGameLogs:', playersGameLogs);
        $log.debug('===============================');

        $scope.saveToFireBase({
          data: players,
          _lastSyncedOn: momentService.syncDate()
        }, 'managerPlayers');

        $scope.saveToFireBase({
          data: gameLogs,
          _lastSyncedOn: momentService.syncDate()
        }, 'managerPlayersLogs');

        $scope.saveToFireBase({
          data: gameLogs,
          _lastSyncedOn: momentService.syncDate()
        }, 'gameLogPlayers');

        $scope.saveToFireBase({
         data: gameLogs,
         _lastSyncedOn: momentService.syncDate()
        }, 'gameLogs');

        $scope.hideSpinner();

      };

      /////////////////////////////
      // MONTHLY
      /////////////////////////////

      /**
       * @name allMonths
       * @description all months dropdown options
       * @type {{monthName: string, range: string[]}[]}
       */
      $scope.allMonths = [{
        monthName: 'All Months',
        range: ['August 1 ' + startYear, 'June 30 ' + endYear]
      }, {
        monthName: 'August ' + startYear,
        range: ['August 1 ' + startYear, 'September 1 ' + startYear]
      }, {
        monthName: 'September ' + startYear,
        range: ['September 1 ' + startYear, 'October 1 ' + startYear]
      }, {
        monthName: 'October ' + startYear,
        range: ['October 1 ' + startYear, 'November 1 ' + startYear]
      }, {
        monthName: 'November ' + startYear,
        range: ['November 1 ' + startYear, 'December 1 ' + startYear]
      }, {
        monthName: 'December ' + startYear,
        range: ['December 1 ' + startYear, 'January 1 ' + endYear]
      }, {
        monthName: 'January ' + endYear,
        range: ['January 1 ' + endYear, 'February 1 ' + endYear]
      }, {
        monthName: 'February ' + endYear,
        range: ['February 1 ' + endYear, 'March 1 ' + endYear]
      }, {
        monthName: 'March ' + endYear,
        range: ['March 1 ' + endYear, 'April 1 ' + endYear]
      }, {
        monthName: 'April ' + endYear,
        range: ['April 1 ' + endYear, 'May 1 ' + endYear]
      }, {
        monthName: 'May ' + endYear,
        range: ['May 1 ' + endYear, 'June 1 ' + endYear]
      }, {
        monthName: 'June ' + endYear,
        range: ['June 1 ' + endYear, 'July 1  ' + endYear]
      }];

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
        if (!_.isDefined(callback)) throw new Error('$scope.startFireBase: the callback parameter was not defined');
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

        var allPlayersIndex = $rootScope.allPlayersIndex || {};

        allPlayersIndex.data = allPlayersIndex.data || {};

        allPlayersIndex.data[playerId] = player;

        $log.debug('allPlayersIndex', allPlayersIndex);

        $scope.saveToFireBase({
          _lastSyncedOn: momentService.syncDate(),
          data: allPlayersIndex
        }, 'allPlayersIndex');

      };

      /**
       * @name saveTeamToPlayerIndex
       * @description pushes an entire team to allPlayersIndex
       * @param teamArray
       */
      $scope.saveTeamToPlayerIndex = function (teamArray) {

        var allPlayersIndex = $rootScope.allPlayersIndex || {};
        allPlayersIndex.data = allPlayersIndex.data || {};
        var teamObj = {};

        _.each(teamArray, function (player) {
          teamObj[player.id] = player;
        });

        var combinedPlayers = _.defaults({}, allPlayersIndex.data, teamObj);

        $scope.saveToFireBase({
          _lastSyncedOn: momentService.syncDate(),
          data: combinedPlayers
        }, 'allPlayersIndex');

      };

      /**
       * @name checkForWildCard
       * @description computed function to determine manager wildcard count
       * @param p
       * @param manager
       */
      $scope.checkForWildCard = function (p, manager) {

        // if player is not dropped then count on active roster
        if (p.player.status !== 'dropped' && angular.isDefined(manager) && (p.playedInChlgGames || p.playedInEuroGames)) {
          if (!p.playedInLigaGames && !p.playedInEPLGames && !p.playedInSeriGames) {
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
        var today = $moment();
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

      var content;

      $scope.showSpinner = function () {

        $('#ui-view').addClass('hidden');
        $('.page-loading').removeClass('hidden');

      };

      $scope.hideSpinner = function () {

        $('#ui-view').removeClass('hidden');
        $('.page-loading').addClass('hidden');

      };

      // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      //   if (toState.resolve) {
      //     $scope.showSpinner();
      //   }
      // });
      // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      //   if (toState.resolve) {
      //     $scope.hideSpinner();
      //   }
      // });

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

        $log.debug('state changed start');

        $scope.showSpinner();

        if (toState.name === 'leagues') {
          if (!_.has(toParams, 'leagueName') || toParams.leagueName === '') {
            toParams.leagueName = 'epl';
          }
          //$log.debug('go to league', toParams.leagueName);
          $state.go('leagues.tables', {
            leagueName: toParams.leagueName
          });
        } else if (toState.name === 'standings') {
          //$log.debug('toState', toState);
          //$log.debug('toParams:', toParams);
          //if (!_.has(toParams, 'leagueName') || toParams.leagueName === '') {
          //  toParams.leagueName = 'epl';
          //}
          //$state.go('standings.tables', {leagueName: toParams.leagueName});
        }
      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        $log.debug('state changed success');

        $scope.hideSpinner();

      });

      $scope.hideSpinner();

    });

})();
