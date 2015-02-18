/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.factory('$fireBaseService', function ($q, $firebase, localStorageService) {

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

      return defer;

    },

    syncLeagueData: function (saveObject) {

      console.log('syncLeagueData -- START');
      var usersRef = ref.child('leagueData');
      localStorageService.set('leagueData', angular.copy(saveObject));
      usersRef.set(angular.copy(saveObject));
      console.log('syncLeagueData -- COMPLETE');

    },

    syncLeagueTeamData: function (saveObject) {

      console.log('syncLeagueTeamData -- START');
      var usersRef = ref.child('managersData');
      localStorageService.set('managersData', angular.copy(saveObject));
      usersRef.set(angular.copy(saveObject));
      console.log('syncLeagueTeamData -- COMPLETE');

    },

    syncAllTeams: function (saveObject) {

      console.log('syncAllTeams -- START');
      var usersRef = ref.child('allTeamsData');
      localStorageService.set('allTeamsData', angular.copy(saveObject));
      usersRef.set(angular.copy(saveObject));
      console.log('syncAllTeams -- COMPLETE');

    },

    syncAllPlayersList: function (saveObject) {

      console.log('syncAllPlayersList -- START');
      var usersRef = ref.child('allPlayersData');
      localStorageService.set('allPlayersData', angular.copy(saveObject));
      usersRef.set(angular.copy(saveObject));
      console.log('syncAllPlayersList -- COMPLETE');

    }

  };

  return fireBaseObj;

});
