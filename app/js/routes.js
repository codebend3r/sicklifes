/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.config(function ($routeProvider) {

  $routeProvider.when('/', {

    redirectTo: '/leagues/',
    templateUrl: 'views/leagues.html',
    controller: 'leaguesCtrl'

  }).when('/leagues/', {

    templateUrl: 'views/leagues.html',
    controller: 'leaguesCtrl'

  }).when('/managers/', {

    templateUrl: 'views/managers.html',
    controller: 'managersCtrl'

  }).when('/player-details/:playerID', {

    templateUrl: 'views/player-details.html',
    controller: 'playersDetailsCtrl'

  }).when('/standings/', {

    templateUrl: 'views/standings.html',
    controller: 'standingsCtrl'

  }).when('/monthlywinners/', {

    templateUrl: 'views/monthly-winners.html',
    controller: 'monthlyWinnersCtrl'

  }).when('/admin/', {

    templateUrl: 'views/admin.html',
    controller: 'adminCtrl'

  }).when('/transfers/', {

    templateUrl: 'views/transfers.html',
    controller: 'transfersCtrl'

  }).otherwise({

    redirectTo: '/leagues/'

  });

});