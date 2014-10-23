/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.factory('$fireBaseService', function ($q, $firebase) {

  var ref,
    sync;

  var fireBaseObj = {

    initialize: function () {
      console.log('initialize');
      ref = new Firebase('https://glaring-fire-9383.firebaseio.com/');
      sync = $firebase(ref);
    },

    getFireBaseData: function () {

      console.log('getFireBaseData');

      var defer = $q.defer();

      ref.on('value', function (snapshot) {

        defer.resolve(snapshot.val());

      }, function (errorObject) {

        console.log('The read failed: ' + errorObject.code);

      });

      return defer;

    },

    saveToFireBase: function () {

      console.log('saveToFireBase');

      var usersRef = ref.child('leagueTeamData');

      delete $leagueTeams.chester.$$hashKey;
      delete $leagueTeams.frank.$$hashKey;
      delete $leagueTeams.dan.$$hashKey;
      delete $leagueTeams.justin.$$hashKey;
      delete $leagueTeams.mike.$$hashKey;
      delete $leagueTeams.joe.$$hashKey;

      var saveObject = {
        __allPlayers: $scope.allPlayers,
        __allLeagues: $scope.allLeagueDataObj.allLeagues,
        //__allTeams: $scope.allTeams,
        chester: $leagueTeams.chester,
        frank: $leagueTeams.frank,
        dan: $leagueTeams.dan,
        justin: $leagueTeams.justin,
        mike: $leagueTeams.mike,
        joe: $leagueTeams.joe
      };

      usersRef.set(saveObject);

    }

  };

  return fireBaseObj;

});
