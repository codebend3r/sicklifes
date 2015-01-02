/**
 * Created by Bouse on 01/01/2015
 */

sicklifesFantasy.factory('$workerService', function () {

  return {

    //var worker = new Worker('./js/workers/statsFetcher.js');

    var defer;

    worker.addEventListener('message', function(e) {
      console.log('Worker said: ', e.data);
      defer.resolve(e.data);
    }, false);

    return {
      doWork : function(myData){
        defer = $q.defer();
        worker.postMessage(myData); // Send data to our worker. 
        return defer.promise;
      }
    };

  }

});