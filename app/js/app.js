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
  'firebase',
  'ui.bootstrap',
  'angular.filter'

]);

sicklifesFantasy.constant('$date', Date);
