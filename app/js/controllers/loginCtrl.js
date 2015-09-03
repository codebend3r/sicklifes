/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('loginCtrl', function ($scope, user, $http) {

      console.log('--> loginCtrl');

      $scope.loading = false;

      // /var currenUser = user.init({ appId: '55e67bdde35f9' });
      //user.init({ appId: '5482b3c1ebdc7' });

      //console.log('currenUser >', currenUser);

      // user.getCurrent().then(function(currentUser) {
      //   console.log('currentUser:', currentUser);
      //   console.log('currentUser:', currentUser.user_id);
      // });

      // $http({
      //   method: 'POST',
      //   data: { appId: '5482b3c1ebdc7', login: 'chester.rivas@gmail.com', password: 'Souldier82' },
      //   url: 'https://api.userapp.io/v1/user.login'
      // }).then(function(d) {
      //
      //   console.log('success', d);
      //
      // }, function(d) {
      //
      //   console.log('error', d);
      //
      // });

      // user.login({ login: 'chester.rivas@gmail.com', password: 'Souldier82' }, function(error, result) {
      //   console.log('error:', error);
      //   console.log('result:', result);
      // });
      //
      // user.login({ login: 'chester.rivas@gmail.com', password: 'Cyclops82' }, function(error, result) {
      //   console.log('error:', error);
      //   console.log('result:', result);
      // });
      //
      // user.login({ login: 'chester.rivas@gmail.com', password: 'DunnyFrench82' }, function(error, result) {
      //   console.log('error:', error);
      //   console.log('result:', result);
      // });
      //
      // user.login({ login: 'crivas', password: 'Souldier82' }, function(error, result) {
      //   console.log('error:', error);
      //   console.log('result:', result);
      // });
      //
      // user.login({ login: 'crivas', password: 'Cyclops82' }, function(error, result) {
      //   console.log('error:', error);
      //   console.log('result:', result);
      // });
      //
      // user.login({ login: 'crivas', password: 'DunnyFrench82' }, function(error, result) {
      //   console.log('error:', error);
      //   console.log('result:', result);
      // });

    });

})();
