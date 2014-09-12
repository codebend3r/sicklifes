/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.config(function ($routeProvider) {

  'use strict';

  $routeProvider.when('/', {
    redirectTo: '/main/',
    templateUrl: 'views/main.html',
    controller: 'mainCtrl'
  }).when('/main/', {
    templateUrl: 'views/main.html',
    controller: 'mainCtrl'
  }).otherwise({
    redirectTo: '/main/'
  });

});