/**
 * Created by crivas on 9/12/2014.
 */

(function () {

  angular.module('sicklifes')

    .config(function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.when('', '/managers');

      //$urlRouterProvider.when('leagues', '/leagues/liga');
      //$urlRouterProvider.when('/leagues/{leagueName}', '/leagues/liga/tables');
      $urlRouterProvider.when('/leagues/:leagueName', '/leagues/:leagueName/tables');

      //$urlRouterProvider.otherwise('/leagues');

      var isAdmin = function ($stateParams) {
        return $stateParams.admin === true;
      };

      $stateProvider
        .state('app', {
          abstract: true,
          template: '<div ui-view="content"></div>',
          controller: 'appCtrl'
        })
        .state('leagues', {

          url: '/leagues/:leagueName',
          templateUrl: 'views/leagues.html',
          controller: 'leaguesCtrl',
          resolve: {
            getLeagueName: function($stateParams) {
              if (!$stateParams.leagueName) {
                $stateParams.leagueName = 'liga';
                // $state.go('leagues.tables', {
                //   leagueName: 'liga'
                // });
              }
              //return $stateParams.leagueName;
            }
          }

        })
        .state('leagues.tables', {

          url: '/tables',
          templateUrl: 'views/tables.html'

        })
        .state('leagues.leaders', {

          url: '/leaders',
          templateUrl: 'views/leaders.html',
          controller: 'leadersCtrl'

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

        .
        state('managers', {

          url: '/managers',
          templateUrl: 'views/managers.html',
          controller: 'managersCtrl'

        })
        .state('playerDetails', {

          url: '/player-details/:playerID',
          templateUrl: 'views/player-details.html',
          controller: 'playersDetailsCtrl'

        })
        .state('standings', {

          url: '/standings',
          templateUrl: 'views/standings.html',
          controller: 'standingsCtrl'

        })
        .state('monthlyWinners', {

          url: '/monthlywinners',
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
        .state('roster', {

          url: '/roster/:leagueName/:teamId',
          templateUrl: 'views/teams.html',
          controller: 'teamsCtrl'

        });

    });

})();
