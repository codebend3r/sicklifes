/**
 * Created by crivas on 9/12/2014.
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .config(function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.when('', '/leagues/liga/tables');
      $urlRouterProvider.when('/', '/leagues/liga/tables');

      //$urlRouterProvider.when('leagues', '/leagues/liga');
      //$urlRouterProvider.when('/leagues/{leagueName}', '/leagues/liga/tables');

      $urlRouterProvider.when('/leagues/:leagueName', '/leagues/:leagueName/tables');
      $urlRouterProvider.when('/leagues', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues/liga', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues//tables', '/leagues/liga/tables');

      $urlRouterProvider.otherwise('/leagues/liga/tables');

      $stateProvider
        .state('app', {

          abstract: true,
          //template: '<div ui-view="content"></div>',
          template: '<ui-view />',
          controller: 'appCtrl'

        })
        .state('signIn', {

          url: '/login',
          parent: 'app',
          templateUrl: 'views/login.html',
          controller: 'loginCtrl',
          data: {
            public: true,
            login: true
          }

        })
        .state('signUp', {

          url: '/signup',
          parent: 'app',
          templateUrl: 'views/signup.html',
          controller: 'loginCtrl',
          data: {
            public: true
          }

        })
        .state('resetPassword', {

          url: '/reset-password',
          parent: 'app',
          templateUrl: 'views/reset-password.html',
          controller: 'loginCtrl',
          data: {
            public: true
          }

        })
        .state('leagues', {

          url: '/leagues/:leagueName',
          parent: 'app',
          templateUrl: 'views/leagues.html',
          controller: 'leaguesCtrl'

        })
        .state('leagues.tables', {

          url: '/tables',
          templateUrl: 'views/tables.html',
          controller: 'tablesCtrl'

        })
        .state('leagues.leaders', {

          url: '/leaders',
          templateUrl: 'views/leaders.html',
          controller: 'leadersCtrl'

        })
        .state('managers', {

          url: '/managers/:managerId',
          parent: 'app',
          templateUrl: 'views/managers.html',
          controller: 'managersCtrl'

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
        .state('monthlyWinners', {

          url: '/monthlywinners',
          parent: 'app',
          templateUrl: 'views/monthly-winners.html',
          controller: 'monthlyWinnersCtrl'

        })
        .state('admin', {

          url: '/admin',
          parent: 'app',
          templateUrl: 'views/admin.html',
          controller: 'adminCtrl'

        })
        .state('transfers', {

          url: '/transfers',
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
