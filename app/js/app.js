/**
 * Created by Bouse on 10/2/2014
 */

if (!String.prototype.contains) {
  String.prototype.contains = function () {
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

var sicklifesFantasy = angular.module('sicklifesFantasy', [

  'ngRoute',
  'ngResource',
  'ngSanitize',
  'LocalStorageModule',
  //'UserApp',
  'jsonFormatter',
  'firebase',
  'ui.bootstrap',
  'angular.filter',
  'highcharts-ng'

]);

//sicklifesFantasy.run(function(user) {
  //user.init({ appId: '5482b3c1ebdc7' });
//});

sicklifesFantasy.constant('$date', Date);

angular.isUndefinedOrNull = function(val) {
  return angular.isUndefined(val) || val === null
}
