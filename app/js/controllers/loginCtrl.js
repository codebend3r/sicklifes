/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('loginCtrl', function ($scope, $log, $http, user) {

      $log.debug('--> loginCtrl');

      $scope.loading = false;

      // /var currenUser = user.init({ appId: '55e67bdde35f9' });
      //user.init({ appId: '5482b3c1ebdc7' });

      //$log.debug('currenUser >', currenUser);

      // user.getCurrent().then(function(currentUser) {
      //   $log.debug('currentUser:', currentUser);
      //   $log.debug('currentUser:', currentUser.user_id);
      // });

      // $http({
      //   method: 'POST',
      //   data: { appId: '5482b3c1ebdc7', login: 'chester.rivas@gmail.com', password: 'Souldier82' },
      //   url: 'https://api.userapp.io/v1/user.login'
      // }).then(function(d) {
      //
      //   $log.debug('success', d);
      //
      // }, function(d) {
      //
      //   $log.debug('error', d);
      //
      // });

      // user.login({ login: 'chester.rivas@gmail.com', password: 'Souldier82' }, function(error, result) {
      //   $log.debug('error:', error);
      //   $log.debug('result:', result);
      // });
      //
      // user.login({ login: 'chester.rivas@gmail.com', password: 'Cyclops82' }, function(error, result) {
      //   $log.debug('error:', error);
      //   $log.debug('result:', result);
      // });
      //
      // user.login({ login: 'chester.rivas@gmail.com', password: 'DunnyFrench82' }, function(error, result) {
      //   $log.debug('error:', error);
      //   $log.debug('result:', result);
      // });
      //
      // user.login({ login: 'crivas', password: 'Souldier82' }, function(error, result) {
      //   $log.debug('error:', error);
      //   $log.debug('result:', result);
      // });
      //
      // user.login({ login: 'crivas', password: 'Cyclops82' }, function(error, result) {
      //   $log.debug('error:', error);
      //   $log.debug('result:', result);
      // });
      //
      // user.login({ login: 'crivas', password: 'DunnyFrench82' }, function(error, result) {
      //   $log.debug('error:', error);
      //   $log.debug('result:', result);
      // });

    });

})();
