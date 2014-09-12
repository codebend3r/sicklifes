/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('mainCtrl', function ($scope, $http) {

  console.log('sicklifesFantasy.mainCtrl');

  'use strict';

  $scope.topScorers = [];

  var url = 'http://api.thescore.com/liga/leaders?categories=goals',
    httpObject = {
      method: 'GET',
      url: url
    };

  $http(httpObject).then(function (result) {
    console.log('ANGULARJS success data', result);
    $scope.topScorers = result.data.goals;
  }, function (data) {
    console.log('ANGULARJS error data', result);
  });


});