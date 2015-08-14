/**
 * Created by crivas on 9/12/2014.
 */

(function () {

  angular.module('sicklifes')

    .config(function ($stateProvider, $urlRouterProvider) {

      console.log('sicklifes --> config');

      //$urlRouterProvider.otherwise('/leagues');

      $urlRouterProvider.when('', '/leagues');

      $stateProvider
        .state('app', {
          abstract: true
        })
        .state('leagues', {

          url: '/leagues',
          templateUrl: 'views/leagues.html',
          //controller: 'leaguesCtrl'
          controller: function() {
            console.log('LEAGUES CTRL');
          }

        });

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


        // .state('managers', {
        //
        //   url: '/managers',
        //   templateUrl: 'views/managers.html',
        //   controller: 'managersCtrl'
        //
        // })
        // .state('/playerDetails', {
        //
        //   url: '/player-details/:playerID',
        //   templateUrl: 'views/player-details.html',
        //   controller: 'playersDetailsCtrl'
        //
        // })
        // .state('standings', {
        //
        //   url: '/standings',
        //   templateUrl: 'views/standings.html',
        //   controller: 'standingsCtrl'
        //
        // })
        // .state('monthlyWinners', {
        //
        //   url: '/monthlywinners',
        //   templateUrl: 'views/monthly-winners.html',
        //   controller: 'monthlyWinnersCtrl'
        //
        // })
        // .state('admin', {
        //
        //   url: '/admin',
        //   templateUrl: 'views/admin.html',
        //   controller: 'adminCtrl'
        //
        // })
        // .state('transfers', {
        //
        //   url: '/transfers',
        //   templateUrl: 'views/transfers.html',
        //   controller: 'transfersCtrl'
        //
        // })
        // .state('teams', {
        //
        //   url: '/teams',
        //   templateUrl: 'views/teams.html',
        //   controller: 'teamsCtrl'
        //
        // });

    });

})();
