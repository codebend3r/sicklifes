/**
 * Created by crivas on 9/12/2014.
 */

if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
    return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}


var sicklifesFantasy = angular.module('sicklifesFantasy', [

  'ngRoute'

]);
