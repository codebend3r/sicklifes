/**
 * Created by crivas on 9/12/2014.
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .config(function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.when('', '/standings');
      $urlRouterProvider.when('/', '/standings');

      $urlRouterProvider.when('/standings', '/standings/overview');

      $urlRouterProvider.when('/leagues', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues/', '/leagues/liga/tables');

      $urlRouterProvider.when('/leagues//tables', '/leagues/liga/tables');

      $urlRouterProvider.when('/managers/', '/managers/chester/overview');
      $urlRouterProvider.when('/managers/:managerId', '/managers/:managerId/overview');

      $urlRouterProvider.when('/managers//overview', '/managers/chester/overview');

      $urlRouterProvider.when('/transfers', '/transfers/chester');
      $urlRouterProvider.when('/transfers/', '/transfers/chester');

      $urlRouterProvider.otherwise('/standings');

      $stateProvider
        .state('app', {

          abstract: true,
          template: '<ui-view />',
          controller: 'appCtrl'

        })
        //.state('signIn', {
        //
        //  url: '/login',
        //  parent: 'app',
        //  templateUrl: 'views/login.html',
        //  controller: 'loginCtrl',
        //  data: {
        //    public: true,
        //    login: true
        //  }
        //
        //})
        //.state('signUp', {
        //
        //  url: '/signup',
        //  parent: 'app',
        //  templateUrl: 'views/signup.html',
        //  controller: 'loginCtrl',
        //  data: {
        //    public: true
        //  }
        //
        //})
        //.state('resetPassword', {
        //
        //  url: '/reset-password',
        //  parent: 'app',
        //  templateUrl: 'views/reset-password.html',
        //  controller: 'loginCtrl',
        //  data: {
        //    public: true
        //  }
        //
        //})
        .state('leagues', {

          url: '/leagues/:leagueName',
          parent: 'app',
          templateUrl: 'views/leagues.html',
          controller: 'leaguesCtrl'

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
        .state('managers', {

          url: '/managers/:managerId',
          parent: 'app',
          templateUrl: 'views/managers.html',
          controller: 'managersCtrl'

        })
        .state('managers.overview', {

          url: '/overview',
          templateUrl: 'views/managers-overview.html'

        })
        .state('managers.gamelogs', {

          url: '/gamelog',
          templateUrl: 'views/managers-gamelogs.html'

        })
        .state('managers.stats', {

          url: '/stats',
          templateUrl: 'views/stats.html',
          controller: 'statsCtrl'

        })
        .state('playerDetails', {

          url: '/player-details/:playerId',
          parent: 'app',
          templateUrl: 'views/player-details.html',
          controller: 'playersDetailsCtrl'

        })
        .state('standings', {

          url: '/standings',
          parent: 'app',
          templateUrl: 'views/standings.html',
          controller: 'standingsCtrl'

        })
        .state('standings.overview', {

          url: '/overview',
          templateUrl: 'views/standings-overview.html'

        })
        .state('standings.latestgoals', {

          url: '/latestgoals',
          templateUrl: 'views/standings-latestgoals.html'

        })
        .state('standings.charts', {

          url: '/charts',
          templateUrl: 'views/standings-charts.html'

        })
        .state('admin', {

          url: '/admin',
          parent: 'app',
          templateUrl: 'views/admin.html',
          controller: 'adminCtrl'

        })
        .state('transfers', {

          url: '/transfers/:managerId',
          parent: 'app',
          templateUrl: 'views/transfers.html',
          controller: 'transfersCtrl'

        })
        .state('roster', {

          url: '/roster/:leagueName/:teamId',
          parent: 'app',
          templateUrl: 'views/rosters.html',
          controller: 'rostersCtrl'

        });

    });

})();
