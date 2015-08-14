(function () {

  angular.module('sicklifes', [

    'ui.router',
    'ngResource',
    'ngSanitize',
    'ngStorage',
    //'UserApp',
    'jsonFormatter',
    'firebase',
    'ui.bootstrap',
    'angular.filter'

  ]);

  //angular.module('sicklifes').run(function(user) {
  //  user.init({ appId: '5482b3c1ebdc7' });
  //});

  angular.module('sicklifes')
    //.run(function(){
      //user.init({ appId: '5482b3c1ebdc7' });
    //})
    .constant('$moment', moment);

    console.log('sicklifes --> module');

})();
