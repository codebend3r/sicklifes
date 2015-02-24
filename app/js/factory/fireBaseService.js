/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.factory('$fireBaseService', function ($q, $firebase, localStorageService, $rootScope) {

  var ref,
    sync,
    syncObject;

  var fireBaseObj = {

    list: null,

    initialize: function (scope) {

      ref = new Firebase('https://glaring-fire-9383.firebaseio.com/');
      sync = $firebase(ref);

      // create a synchronized array for use in our HTML code
      //var syncArray = sync.$asArray();
      syncObject = sync.$asObject();

      syncObject.$bindTo(scope, 'syncedObject');

    },

    getFireBaseData: function () {

      var defer = $q.defer();

      ref.on('value', function (snapshot) {
        defer.resolve(snapshot.val());
      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });

      return defer.promise;

    },

    syncLeagueLeadersData: function (saveObject) {

      //console.log('syncLeagueLeadersData -- START');
      var usersRef = ref.child('leagueLeadersData');
      //localStorageService.set('leagueLeadersData', angular.copy(saveObject));
      usersRef.set(angular.copy(saveObject));
      //console.log('syncLeagueLeadersData -- COMPLETE');

    },

    syncManagersData: function (saveObject) {

      //console.log('syncManagersData -- START');
      var usersRef = ref.child('managersData');
      localStorageService.set('managersData', angular.copy(saveObject));
      $rootScope.managersData = angular.copy(saveObject);
      usersRef.set(angular.copy(saveObject));
      //console.log('syncManagersData -- COMPLETE');

    },

    syncAllLeagueTeamsData: function (saveObject) {

      //console.log('syncAllLeagueTeamsData -- START');
      var usersRef = ref.child('allLeagueTeamsData');
      //localStorageService.set('allLeagueTeamsData', angular.copy(saveObject));
      usersRef.set(angular.copy(saveObject));
      //console.log('syncAllLeagueTeamsData -- COMPLETE');

    },

    syncPlayerPoolData: function (saveObject) {

      //console.log('syncPlayerPoolData -- START');
      var usersRef = ref.child('playerPoolData');
      //localStorageService.set('playerPoolData', angular.copy(saveObject));
      usersRef.set(angular.copy(saveObject));
      //console.log('syncPlayerPoolData -- COMPLETE');

    }

  };

  return fireBaseObj;

});
