/**
 * Created by Bouse on 6/1/2014
 */

if (!String.prototype.contains) {
  String.prototype.contains = function () {
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

angular.isUndefinedOrNull = function (val) {
  return angular.isUndefined(val) || val === null;
};

angular.module('sicklifes', [

  'ngRoute',
  'ngResource',
  'ngSanitize',
  'ngStorage',
  //'UserApp',
  'jsonFormatter',
  'firebase',
  'ui.bootstrap',
  'angular.filter',
  'highcharts-ng'

]);

//angular.module('sicklifes').run(function(user) {
//user.init({ appId: '5482b3c1ebdc7' });
//});

angular.module('sicklifes')
  .constant('$date', Date);
