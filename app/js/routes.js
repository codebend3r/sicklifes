/**
 * Created by crivas on 9/12/2014.
 */

(function () {

  angular.module('sicklifes')

    .config(function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.when('', '/leagues');

      //$urlRouterProvider.otherwise('/leagues');

      var isAdmin = function($stateParams) {
        return $stateParams.admin === true;
      };

      $stateProvider
        .state('app', {
          abstract: true,
          template: '<div ui-view="content"></div>',
          controller: 'appCtrl'
        })
        .state('leagues', {

          url: '/leagues/:admin',
          templateUrl: 'views/leagues.html',
          controller: 'leaguesCtrl',
          resolve: {
            isAdmin: isAdmin
          }

        })

        //.state('login', {
        //
        //  url: '/login',
        //  templateUrl: 'views/login.html',
        //  login: true
        //
        //})
        //.state('signup', {
        //
        //  url: '/signup',
        //  templateUrl: 'views/signup.html',
        //  public: true
        //
        //})

        .state('managers', {

          url: '/managers/:admin',
          templateUrl: 'views/managers.html',
          controller: 'managersCtrl'

        })
        .state('playerDetails', {

          url: '/player-details/:playerID/:admin',
          templateUrl: 'views/player-details.html',
          controller: 'playersDetailsCtrl'

        })
        .state('standings', {

          url: '/standings/:admin',
          templateUrl: 'views/standings.html',
          controller: 'standingsCtrl'

        })
        .state('monthlyWinners', {

          url: '/monthlywinners/:admin',
          templateUrl: 'views/monthly-winners.html',
          controller: 'monthlyWinnersCtrl'

        })
        .state('admin', {

          url: '/admin',
          templateUrl: 'views/admin.html',
          controller: 'adminCtrl'

        })
        .state('transfers', {

          url: '/transfers',
          templateUrl: 'views/transfers.html',
          controller: 'transfersCtrl'

        })
        .state('teams', {

          url: '/teams/:leagueName/:teamId',
          templateUrl: 'views/teams.html',
          controller: 'teamsCtrl'

        });

    });

})();
