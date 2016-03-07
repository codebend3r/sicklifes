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
      $rootScope.edit = $location.search().edit;

      $rootScope.$watch(function () {
        return $location.search().edit;
      }, function (nv, ov) {
        $rootScope.edit = angular.isDefined(nv) && !!nv;
      }, true);

      /**
       * @name draftMode
       * @description if manually adding players to roster
       * @type {boolean}
       */
      $scope.draftMode = $location.search().draftMode;

      /////////////////////////////
      // ROSTER
      /////////////////////////////

      //$scope.managersList = ['chester', 'frank', 'joe', 'justin', 'dan', 'mike'];

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

        console.log('//////////////////////////////');
        console.log('SAVING MANAGERS DATA');
        console.log('//////////////////////////////');

        if (Array.isArray(managerData)) {
          console.warn('managerData can not be an array');
          return false;
        }
        ;

        var managerCore = {};
        var gameLogs = {};
        var charts = {};
        var managerPlayers = {};
        var index = 0;

        _.each(managerData, function (manager, key) {

          manager.managerName = key;
          index += 1;

          managerCore[key] = {
            managerName: key,
            players: {}
          };

          gameLogs[key] = {
            managerName: key,
            filteredMonthlyGoalsLog: manager.filteredMonthlyGoalsLog,
            monthlyGoalsLog: manager.monthlyGoalsLog
          };

          charts[key] = {
            managerName: key,
            chartData: manager.chartData
          };

          angular.isDefined(manager.filteredMonthlyGoalsLog) && delete manager.filteredMonthlyGoalsLog;
          angular.isDefined(manager.monthlyGoalsLog) && delete manager.monthlyGoalsLog;
          angular.isDefined(manager.chartData) && delete manager.chartData;
          angular.isDefined(manager.gameLogs) && delete manager.gameLogs;
          angular.isDefined(manager.charts) && delete manager.charts;

          _.each(manager.players, function (p) {

            //managerCore[key].players = player;

            if (angular.isUndefinedOrNull(managerCore[key])) {
              managerCore[key] = {
                players: {}
              };
            }

            // if (angular.isUndefinedOrNull(player.league) || angular.isUndefinedOrNull(player.league.leagueName) || angular.isUndefinedOrNull(player.league.leagueSlugs)) {
            //   console.log('player', player);
            //   debugger;
            // }

            managerCore[key].players[p.id] = {
              player: p.player,
              team: p.team,
              league: p.league,
              manager: p.manager,
              stats: {},
              // active: !angular.isUndefinedOrNull(p.active) ? p.active === false : false,
              active: true,
              dateOfTransaction: p.dateOfTransaction,
              transactions: []
              // transactions: !angular.isUndefinedOrNull(p.transactions) ? p.transactions : [
              //   {
              //     date: p.dateOfTransaction,
              //     status: p.player.status
              //   }
              // ]
            };

            // clean up
            angular.isDefined(p.seriGameLog) && delete p.seriGameLog;
            angular.isDefined(p.eplGameLog) && delete p.eplGameLog;
            angular.isDefined(p.ligaGameLog) && delete p.ligaGameLog;
            angular.isDefined(p.chlgGameLog) && delete p.chlgGameLog;
            angular.isDefined(p.euroGameLog) && delete p.euroGameLog;
            angular.isDefined(p.allLeaguesName) && delete p.allLeaguesName;
            angular.isDefined(p.id) && delete p.id;
            angular.isDefined(p.playerName) && delete p.playerName;
            angular.isDefined(p.playerImage) && delete p.playerImage;
            //angular.isDefined(p.injured) && delete p.injured;
            angular.isDefined(p.status) && delete p.status;
            angular.isDefined(p.pickNumber) && delete p.pickNumber;
            angular.isDefined(p.teamId) && delete p.teamId;
            angular.isDefined(p.teamName) && delete p.teamName;
            angular.isDefined(p.teamLogo) && delete p.teamLogo;
            angular.isDefined(p.leagueName) && delete p.leagueName;
            angular.isDefined(p.leagueSlugs) && delete p.leagueSlugs;

          });

          managerPlayers[key] = {
            managerName: key,
            players: manager.players
          };

          angular.isDefined(manager.players) && delete manager.players;

        });

        //////////////////////////////////

        console.log('===============================');
        console.log('managerCore', managerCore);
        console.log('===============================');

        if (_.hasDeepProperty(gameLogs, 'managerName') && _.hasDeepProperty(gameLogs, 'filteredMonthlyGoalsLog') && _.hasDeepProperty(gameLogs, 'monthlyGoalsLog')) {
          console.log('gameLogs test passsed');
        } else {
          console.log('gameLogs test failed');
          return false;
        }

        if (_.hasDeepProperty(charts, 'managerName') && _.hasDeepProperty(charts, 'chartData')) {
          console.log('charts test passsed');
        } else {
          console.log('charts test failed');
          return false;
        }

        if (_.hasDeepProperty(managerPlayers, 'players')) {

          console.log('---------------------------');
          console.log('managerPlayers test passsed');

          // var hasPlayerId = _.allManagersPlayersHave(managerPlayers, 'player.id');
          //
          // if (hasPlayerId) {
          //   console.log('all players have a \'player.id\' property');
          // } else {
          //   console.log('all players DO NOT have \'player.id\' property');
          //   debugger;
          //   return false;
          // }

        } else {
          console.log('managerPlayers test failed');
          debugger;
          return false;
        }

        // if (_.hasDeepProperty(managerPlayers, 'manager')) {
        //
        //   var hasPlayerId = _.allManagersPlayersHave(managerPlayers, 'manager.name');
        //
        //   if (hasPlayerId) {
        //     console.log('all players have a \'manager.name\' property');
        //   } else {
        //     console.log('all players DO NOT have \'manager.name\' property');
        //     debugger;
        //     return false;
        //   }
        // }

        // if (_.hasDeepProperty(managerData, 'managerName') && _.hasDeepProperty(managerData, 'totalPoints') && _.hasDeepProperty(managerData, 'totalGoals')) {
        //   console.log('managerData test passsed');
        // } else {
        //   console.log('managerData test failed');
        //   debugger;
        //   return false;
        // }

        if (_.hasDeepProperty(managerCore, 'managerName') && _.hasDeepProperty(managerCore, 'players')) {

          console.log('---------------------------');
          console.log('managerCore test passsed');

          // _.each(managerCore, function(m) {
          //   console.log('# of players', _.keys(m.players).length);
          // });

          // _.each(managerCore, function(m) {
          //   return _.each(m.players, function(p) {
          //     console.log(p.playerName, 'leagueName', p.league);
          //   });
          // });

          // var hasPlayer = _.allManagersPlayersHave(managerCore, 'player');
          var hasPlayer = _.every(managerCore, function (m) {
            return !angular.isUndefinedOrNull(m.players) && _.every(m.players, function (eachPlayer) {
                return !angular.isUndefinedOrNull(eachPlayer['player']);
              });
          });


          if (hasPlayer) {
            console.log('all players have \'player\' property');
          } else {
            console.log('all players DO NOT have \'player\' property');
            debugger;
            return false;
          }

          //var key = 'player.id';
          //var obj = managerCore;

          var hasPlayerId = _.allHaveProperty(managerCore, 'player.id');
          //var hasPlayerId = _.every(obj, function (m) {
          //
          //  return !angular.isUndefinedOrNull(m.players) && _.every(m.players, function (eachPlayer) {
          //
          //      if (key.indexOf('.') !== -1) {
          //
          //        var maxLevels = key.split('.').length,
          //          level = 0,
          //          currentObjectKey = key.split('.')[level];
          //
          //        var checkObject = function (parentObj, childKey) {
          //          console.log('checking for', childKey, 'in', parentObj);
          //          if (angular.isUndefinedOrNull(parentObj[childKey])) {
          //            console.warn('FAILED: could not find property \'', childKey, '\' in', parentObj);
          //            return false;
          //          } else {
          //            level += 1;
          //            if (level < maxLevels) {
          //              return !angular.isUndefinedOrNull(parentObj[childKey]) && checkObject(parentObj[childKey], key.split('.')[level]);
          //            } else {
          //              return true;
          //            }
          //          }
          //        };
          //        return checkObject(eachPlayer, currentObjectKey);
          //      } else {
          //        return !angular.isUndefinedOrNull(eachPlayer[key]);
          //      }
          //    });
          //
          //});

          if (hasPlayerId) {
            console.log('all players have \'player.id\' property');
          } else {
            console.log('all players DO NOT have \'player.id\' property');
            debugger;
            return false;
          }

          var hasPlayerName = _.allHaveProperty(managerCore, 'player.name');

          if (hasPlayerName) {
            console.log('all players have \'player.name\' property');
          } else {
            console.log('all players DO NOT have \'player.name\' property');
            debugger;
            return false;
          }

          var hasStatus = _.allHaveProperty(managerCore, 'player.status');

          if (hasStatus) {
            console.log('all players have \'player.status\' property');
          } else {
            console.log('all players DO NOT have \'player.status\' property');
            debugger;
            return false;
          }

          var hasImage = _.allHaveProperty(managerCore, 'player.image');

          if (hasImage) {
            console.log('all players have \'player.image\' property');
          } else {
            console.log('all players DO NOT have \'player.image\' property');
            debugger;
            return false;
          }

          var hasPickNumber = _.allHaveProperty(managerCore, 'player.pickNumber');

          if (hasPickNumber) {
            console.log('all players have \'player.pickNumber\' property');
          } else {
            console.log('all players DO NOT have \'player.pickNumber\' property');
            debugger;
            return false;
          }

          var shouldFail = _.allHaveProperty(managerCore, 'player.shouldFail');

          if (!shouldFail) {
            console.log('all players NOT have \'player.shouldFail\' property');
          } else {
            console.log('all players DO have \'player.shouldFail\' property');
            debugger;
            return false;
          }

          var hasManager = _.allHaveProperty(managerCore, 'manager');

          if (hasManager) {
            console.log('all players have \'manager\' property');
          } else {
            console.log('all players DO NOT have \'manager\' property');
            debugger;
            return false;
          }

          var hasManagerName = _.allHaveProperty(managerCore, 'manager.name');

          if (hasManagerName) {
            console.log('all players have \'manager.name\' property');
          } else {
            console.log('all players DO NOT have \'manager.name\' property');
            debugger;
            return false;
          }

          var hasActive = _.allHaveProperty(managerCore, 'active');

          if (hasActive) {
            console.log('all players have \'active\' property');
          } else {
            console.log('all players DO NOT have \'active\' property');
            debugger;
            return false;
          }


          var hasDateOfTransaction = _.allHaveProperty(managerCore, 'dateOfTransaction');

          if (hasDateOfTransaction) {
            console.log('all players have \'dateOfTransaction\' property');
          } else {
            console.log('all players DO NOT have \'dateOfTransaction\' property');
            debugger;
            return false;
          }

          var hasLeague = _.allHaveProperty(managerCore, 'league');

          if (hasLeague) {
            console.log('all players have \'league\' property');
          } else {
            console.log('all players DO NOT have \'league\' property');
            debugger;
            return false;
          }

          var hasLeagueName = _.allHaveProperty(managerCore, 'league.name');

          if (hasLeagueName) {
            console.log('all players have \'league.name\' property');
          } else {
            console.log('all players DO NOT have \'league.name\' property');
            debugger;
            return false;
          }

          var hasLeagueSlugs = _.allHaveProperty(managerCore, 'league.slugs');

          if (hasLeagueSlugs) {
            console.log('all players have \'league.slugs\' property');
          } else {
            console.log('all players DO NOT have \'league.slugs\' property');
            debugger;
            return false;
          }

          var hasTeam = _.allHaveProperty(managerCore, 'team');

          if (hasTeam) {
            console.log('all players have \'team\' property');
          } else {
            console.log('all players DO NOT have \'team\' property');
            debugger;
            return false;
          }

          var hasTeamId = _.allHaveProperty(managerCore, 'team.id');

          if (hasTeamId) {
            console.log('all players have \'team.id\' property');
          } else {
            console.log('all players DO NOT have \'team.id\' property');
            debugger;
            return false;
          }

          var hasTeamName = _.allHaveProperty(managerCore, 'team.name');

          if (hasTeamName) {
            console.log('all players have \'team.name\' property');
          } else {
            console.log('all players DO NOT have \'team.name\' property');
            debugger;
            return false;
          }

          var hasTeamLogo = _.allHaveProperty(managerCore, 'team.logo');

          if (hasTeamLogo) {
            console.log('all players have \'team.logo\' property');
          } else {
            console.log('all players DO NOT have \'team.logo\' property');
            debugger;
            return false;
          }

          var hasTransactions = _.allHaveProperty(managerCore, 'transactions');

          if (hasTransactions) {
            console.log('all players have \'transactions\' property');
          } else {
            console.log('all players DO NOT have \'transactions\' property');
            debugger;
            return false;
          }

        } else {
          console.log('managerCore test failed');
          return false;
        }

        //////////////////////////////////

        $scope.saveToFireBase({
          data: managerCore,
          _lastSyncedOn: momentService.syncDate()
        }, 'managerCore');

        // .then(function() {
        //
        //   return $scope.saveToFireBase({
        //     data: managerData,
        //     _lastSyncedOn: momentService.syncDate(),
        //   }, 'managerData');
        //
        // })
        // .then(function() {
        //
        //   return $scope.saveToFireBase({
        //    data: managerPlayers,
        //    _lastSyncedOn: momentService.syncDate()
        //   }, 'managerPlayers');
        //
        // })
        // .then(function() {
        //
        //   return $scope.saveToFireBase({
        //    data: charts,
        //    _lastSyncedOn: momentService.syncDate()
        //   }, 'charts');
        //
        // })
        // .then(function() {
        //
        //   return $scope.saveToFireBase({
        //    data: gameLogs,
        //    _lastSyncedOn: momentService.syncDate()
        //   }, 'gameLogs');
        //
        // });

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

        var allPlayersIndex = $rootScope.allPlayersIndex || {};

        allPlayersIndex.data = allPlayersIndex.data || {};

        allPlayersIndex.data[playerId] = player;

        console.log('allPlayersIndex', allPlayersIndex);

        $scope.saveToFireBase({
          _lastSyncedOn: momentService.syncDate(),
          //data: {}
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

        console.log('state changed start');

        $scope.showSpinner();

        if (toState.name === 'leagues') {
          if (!_.has(toParams, 'leagueName') || toParams.leagueName === '') {
            toParams.leagueName = 'epl';
          }
          //console.log('go to league', toParams.leagueName);
          $state.go('leagues.tables', {
            leagueName: toParams.leagueName
          });
        } else if (toState.name === 'standings') {
          //console.log('toState', toState);
          //console.log('toParams:', toParams);
          //if (!_.has(toParams, 'leagueName') || toParams.leagueName === '') {
          //  toParams.leagueName = 'epl';
          //}
          //$state.go('standings.tables', {leagueName: toParams.leagueName});
        }
      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        console.log('state changed success');

        $scope.hideSpinner();

      });

      $scope.hideSpinner();

    });

})();
