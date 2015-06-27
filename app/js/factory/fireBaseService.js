/**
 * Created by Bouse on 10/2/2014
 */


angular.module('sicklifes')

  .factory('$fireBaseService', function ($q, $firebase, $rootScope, $localStorage) {

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

      saveToFireBase: function (saveObject, key) {

        console.log('saveToFireBase -- START');

        var cleanedData = angular.copy(saveObject);

        var usersRef = ref.child(key);

        // save to local storage
        $localStorage[key] = cleanedData;

        // save to $rootScope
        $rootScope[key] = cleanedData

        console.log('cleanedData', cleanedData);

        usersRef.set(cleanedData);
        console.log('saveToFireBase -- COMPLETE');

      }

    };

    return fireBaseObj;

  });
