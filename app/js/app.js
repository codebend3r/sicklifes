/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes', [

    'ui.router',
    'ui.router.tabs',
    'ui.bootstrap',
    'ngResource',
    'ngSanitize',
    'ngStorage',
    'UserApp',
    'jsonFormatter',
    'firebase',
    'angular.filter'

  ])

  .constant('$moment', moment)

  .run(function(user) {
    user.init({ appId: '5482b3c1ebdc7' });
  })

  .filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return (a[field] > b[field] ? 1 : -1);
      });
      if(reverse) filtered.reverse();
      return filtered;
    };
  });

  // $(function(){
  //   var navMain = $("#nav-main");
  //   navMain.on("click", "a", null, function () {
  //     navMain.collapse('hide');
  //   });
  // });


})();
