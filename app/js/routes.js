/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.config(function ($routeProvider) {

  'use strict';

  $routeProvider.when('/', {

    redirectTo: '/leagues/',
    templateUrl: 'views/leagues.html',
    controller: 'leaguesCtrl'

  }).when('/leagues/', {

    templateUrl: 'views/leagues.html',
    controller: 'leaguesCtrl'

  }).when('/players/', {

    templateUrl: 'views/players.html',
    controller: 'playersCtrl'

  }).when('/player-details/:playerID', {

    templateUrl: 'views/player-details.html',
    controller: 'playersDetailsCtrl'

  }).when('/standings/', {

    templateUrl: 'views/standings.html',
    controller: 'standingsCtrl'

  }).otherwise({

    redirectTo: '/leagues/'

  });

});