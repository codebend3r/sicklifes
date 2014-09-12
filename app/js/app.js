/**
 * Created by crivas on 9/12/2014.
 */


var sicklifesFantasy = angular.module('sicklifesFantasy', [

  'ngRoute'

]);

sicklifesFantasy.config(function ($routeProvider) {

  'use strict';

  $routeProvider.when('/', {
    redirectTo: '/main/',
    templateUrl: 'views/main.html',
    controller: 'mainCtrl'
  }).otherwise({
    redirectTo: '/main/'
  });
});

sicklifesFantasy.controller('mainCtrl', function ($scope, $http) {

  'use strict';

  $scope.topScorers = [];

  var url = 'http://api.thescore.com/liga/leaders?categories=goals',
    httpObject = {
      method: 'JSONP',
      url: url,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

  $http(httpObject).then(function (data) {
    console.log('success data');
    $scope.topScorers = data.goals;
  });


});
