/**
 * Created by Bouse on 9/18/2014.
 */

sicklifesFantasy.directive('preloader', function(){

  return {
    restrict: 'E',
    replace: false,
    scope: {
      //loading: '='
    },
    templateURL: 'views/directives/preloader.html',
    link: function() {
      console.log('preloader -- link');
    }
  }

});
