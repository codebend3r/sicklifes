/**
 * Created by crivas on 9/12/2014.
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .config(function ($stateProvider, $urlRouterProvider) {

      var self = this;

      /**
       * @name init
       * @description init the controller
       * @param keyName {string}
       */
      var init = function () {
        var defer = $q.defer();

        if (angular.isDefined($rootScope['managersData'])) {
          console.log('$rootScope');
          defer.resolve($rootScope['managersData']);
          return defer.promise;
        } else if (angular.isDefined($localStorage['managersData'])) {
          console.log('$localStorage');
          $rootScope['managersData'] = $localStorage['managersData'];
          defer.resolve($localStorage['managersData']);
          return defer.promise;
        } else {
          console.log('$http');
          return apiFactory.getApiData('managersData');
        }

      };

      $urlRouterProvider.when('', '/standings');
      $urlRouterProvider.when('/', '/standings');

      $urlRouterProvider.when('/standings', '/standings/overview');

      $urlRouterProvider.when('/leagues', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues/', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues//tables', '/leagues/liga/tables');

      $urlRouterProvider.when('/managers', '/managers/chester/overview');
      $urlRouterProvider.when('/managers/', '/managers/chester/overview');
      $urlRouterProvider.when('/managers//overview', '/managers/chester/overview');
      $urlRouterProvider.when('/managers/:managerId', '/managers/:managerId/overview');
      $urlRouterProvider.when('/managers/:managerId/overview/', '/managers/:managerId/overview');

      $urlRouterProvider.when('/transfers', '/transfers/chester/history');
      $urlRouterProvider.when('/transfers/chester', '/transfers/chester/history');
      $urlRouterProvider.when('/transfers/', '/transfers/chester/history');

      $urlRouterProvider.otherwise('/standings');


      $stateProvider
        .state('app', {
          abstract: true,
          template: '<ui-view />',
          controller: 'appCtrl',
          resolve: {
            managersData: function (apiFactory) {
              return apiFactory.getApiData('managersData');
            },
            leagueTables: function (apiFactory) {
              return apiFactory.getApiData('leagueTables');
            },
            scoringLeaders: function (apiFactory) {
              return apiFactory.getApiData('scoringLeaders');
            }
          }
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
        .state('transfers.history', {
          url: '/history',
          templateUrl: 'views/transfers-history.html',
        })
        .state('transfers.freeagency', {
          url: '/freeagency',
          templateUrl: 'views/transfers-freeagency.html',
        })
        .state('roster', {
          url: '/roster/:leagueName/:teamId',
          parent: 'app',
          templateUrl: 'views/rosters.html',
          controller: 'rostersCtrl'
        });
    });

})();
