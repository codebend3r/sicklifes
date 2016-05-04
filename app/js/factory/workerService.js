/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('workerService', function () {

      var worker,
        defer;

      worker = new Worker('./js/workers/statsFetcher.js');

      worker.addEventListener('message', function (e) {
        $log.debug('Worker said: ', e.data);
        defer.resolve(e.data);
      }, false);

      return {
        doWork: function (myData) {
          defer = $q.defer();
          worker.postMessage(myData); // Send data to our worker.
          return defer.promise;
        }
      };

    });

})();