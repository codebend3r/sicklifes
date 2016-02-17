/**
 * Created by crivas on 9/12/2014.
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .config(function ($stateProvider, $urlRouterProvider) {

      console.log('-- config routes --');

      //var self = this;

      /**
       * @name init
       * @description init the controller
       * @param keyName {string}
       */
        //var init = function () {
        //  var defer = $q.defer();
        //
        //  if (angular.isDefined($rootScope['managerData'])) {
        //    console.log('$rootScope');
        //    defer.resolve($rootScope['managerData']);
        //    return defer.promise;
        //  } else if (angular.isDefined($localStorage['managerData'])) {
        //    console.log('$localStorage');
        //    $rootScope['managerData'] = $localStorage['managerData'];
        //    defer.resolve($localStorage['managerData']);
        //    return defer.promise;
        //  } else {
        //    console.log('$http');
        //    return apiFactory.getApiData('managerData');
        //  }
        //
        //};

      $urlRouterProvider.when('', '/standings');
      $urlRouterProvider.when('/', '/standings');

      $urlRouterProvider.when('/standings', '/standings/overview');

      $urlRouterProvider.when('/leagues', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues/', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues/:leagueName', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues//tables', '/leagues/liga/tables');

      $urlRouterProvider.when('/managers', '/managers/chester/overview');
      $urlRouterProvider.when('/managers/', '/managers/chester/overview');
      $urlRouterProvider.when('/managers//overview', '/managers/chester/overview');
      $urlRouterProvider.when('/managers/:managerId', '/managers/:managerId/overview');
      $urlRouterProvider.when('/managers/:managerId/overview/', '/managers/:managerId/overview');

      $urlRouterProvider.when('/transfers', '/transfers/chester/history');
      $urlRouterProvider.when('/transfers/chester', '/transfers/chester/history');
      $urlRouterProvider.when('/transfers/', '/transfers/chester/history');

      $urlRouterProvider.otherwise('/test');


      $stateProvider
        .state('app', {
          abstract: true,
          template: '<ui-view />',
          controller: 'appCtrl'
        })
        //.state('signIn', {
        //  url: '/login',
        //  parent: 'app',
        //  templateUrl: 'views/login.html',
        //  controller: 'loginCtrl',
        //  data: {
        //    public: true,
        //    login: true
        //  }
        //})
        //.state('signUp', {
        //  url: '/signup',
        //  parent: 'app',
        //  templateUrl: 'views/signup.html',
        //  controller: 'loginCtrl',
        //  data: {
        //    public: true
        //  }
        //})
        //.state('resetPassword', {
        //  url: '/reset-password',
        //  parent: 'app',
        //  templateUrl: 'views/reset-password.html',
        //  controller: 'loginCtrl',
        //  data: {
        //    public: true
        //  }
        //})

        // leagues
        .state('leagues', {
          url: '/leagues/:leagueName',
          parent: 'app',
          templateUrl: 'views/leagues.html',
          controller: 'leaguesCtrl',
          resolve: {
            leagueTables: function (apiFactory) {
              return apiFactory.getApiData('leagueTables');
            },
            leagueLeaders: function (apiFactory) {
              return apiFactory.getApiData('leagueLeaders');
            }
          }
        })
        .state('leagues.tables', {
          url: '/tables',
          templateUrl: 'views/leagues-tables.html',
          controller: 'tablesCtrl'
        })
        .state('leagues.leaders', {
          url: '/leaders',
          templateUrl: 'views/leagues-leaders.html',
          controller: 'leadersCtrl'
        })

        // standings
        .state('standings', {
          url: '/standings',
          parent: 'app',
          templateUrl: 'views/standings.html',
          controller: 'standingsCtrl',
          resolve: {
            managerData: function (apiFactory) {
              return apiFactory.getApiData('managerData');
            }
          }
        })
        .state('standings.overview', {
          url: '/overview',
          templateUrl: 'views/standings-overview.html'
        })
        .state('standings.latestgoals', {
          url: '/latestgoals',
          templateUrl: 'views/standings-latestgoals.html',
          controller: 'latestGoalsCtrl',
          resolve: {
            gameLogs: function (apiFactory) {
              return apiFactory.getApiData('gameLogs');
            }
          }
        })
        .state('standings.charts', {
          url: '/charts',
          templateUrl: 'views/standings-charts.html'
        })

        // managers
        .state('managers', {
          url: '/managers/:managerId',
          parent: 'app',
          templateUrl: 'views/managers.html',
          controller: 'managersCtrl',
          resolve: {
            managerData: function (apiFactory) {
              return apiFactory.getApiData('managerData');
            },
            managerPlayers: function (apiFactory) {
              return apiFactory.getApiData('managerPlayers');
            },
            gameLogs: function (apiFactory) {
              return apiFactory.getApiData('gameLogs');
            }
          }
        })
        .state('managers.overview', {
          url: '/overview',
          templateUrl: 'views/managers-overview.html'
        })
        .state('managers.gamelogs', {
          url: '/gamelog',
          templateUrl: 'views/managers-gamelogs.html'
        })
        //.state('managers.stats', {
        //  url: '/stats',
        //  templateUrl: 'views/stats.html'
        //  controller: 'statsCtrl'
        //})

        // transfer
        .state('transfers', {
          url: '/transfers/:managerId',
          parent: 'app',
          templateUrl: 'views/transfers.html',
          controller: 'transfersCtrl',
          resolve: {
            managerData: function (apiFactory) {
              return apiFactory.getApiData('managerData');
            },
            managerPlayers: function (apiFactory) {
              return apiFactory.getApiData('managerPlayers');
            },
            playerPoolData: function(apiFactory) {
              return apiFactory.getApiData('playerPoolData');
            }
          }
        })
        .state('transfers.history', {
          url: '/history',
          templateUrl: 'views/transfers-history.html',
        })
        .state('transfers.freeagency', {
          url: '/freeagency',
          templateUrl: 'views/transfers-freeagency.html',
        })

        // player details
        .state('playerDetails', {
          url: '/player-details/:playerId',
          parent: 'app',
          templateUrl: 'views/player-details.html',
          controller: 'playersDetailsCtrl',
          resolve: {
            managerData: function (apiFactory) {
              return apiFactory.getApiData('managerData');
            },
            managerPlayers: function (apiFactory) {
              return apiFactory.getApiData('managerPlayers');
            },
            gameLogs: function (apiFactory) {
              return apiFactory.getApiData('gameLogs');
            },
            leagueTables: function (apiFactory) {
              return apiFactory.getApiData('leagueTables');
            },
            leagueLeaders: function (apiFactory) {
              return apiFactory.getApiData('leagueLeaders');
            },
            charts: function (apiFactory) {
              return apiFactory.getApiData('charts');
            },
          }
        })

        // roster
        .state('roster', {
          url: '/roster/:leagueName/:teamId',
          parent: 'app',
          templateUrl: 'views/rosters.html',
          controller: 'rostersCtrl',
          resolve: {
            managerData: function (apiFactory) {
              return apiFactory.getApiData('managerData');
            },
            managerPlayers: function (apiFactory) {
              return apiFactory.getApiData('managerPlayers');
            },
            leagueTables: function (apiFactory) {
              return apiFactory.getApiData('leagueTables');
            }
          }
        });
    });

})();
