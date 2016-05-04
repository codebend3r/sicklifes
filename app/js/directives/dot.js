/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('dot', function() {

      return {
        restrict: 'E',
        replace: true,
        scope: {
          className: '@'
        },
        template: '<svg class="dot-container" height="10" width="10">' +
        '<circle class="dot" ng-class="className" cx="5" cy="5" r="5"/>' +
        'Sorry, your browser does not support inline SVG.' +
        '</svg>'
      };

    });

})();
