/**
 * Created by crivas on 10/02/2014
 */

if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
    return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}


var sicklifesFantasy = angular.module('sicklifesFantasy', [

  'ngRoute',
  'ngResource',
  'LocalStorageModule'

]);

sicklifesFantasy.constant('$date', Date);
