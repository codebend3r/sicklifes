/**
 * Created by crivas on 9/12/2014.
 */


sicklifesFantasy.factory('$apiFactory', function ($http, $q, localStorageService, $arrayLoopers, $date) {

  var scope = {};

  scope.getData = function (endPoint) {

    var defer = $q.defer(),
      httpObject = {
        method: endPoint.method || 'GET',
        url: endPoint.endPointURL
      };

    $http(httpObject).then(function (result) {

      defer.resolve(result);
      if (angular.isDefined(endPoint.qCallBack)) endPoint.qCallBack(result);

    });

    return defer;

  };

  scope.getAllLeagues = function (cbObj) {

    console.log('>> allLeagues', localStorageService.get('allLeagues'));

    if (localStorageService.get('allLeagues')) {

      console.log('get from localStorage');

      var currentDate = $date.create(),
        lDate = localStorageService.get('lastCheckDate'),
        lastDate = Date.create(lDate);

      console.log('lDate', lDate);
      console.log('lastDate', lastDate);
      console.log('DIFF', Math.abs(currentDate - lastDate));

      cbObj.allLeagues = localStorageService.get('allLeagues');
      cbObj.liga = localStorageService.get('liga');
      cbObj.epl = localStorageService.get('epl');
      cbObj.seri = localStorageService.get('seri');
      cbObj.chlg = localStorageService.get('chlg');
      cbObj.uefa = localStorageService.get('uefa');
      cbObj.cb();

      return [];

    } else {

      console.log('get from server');

      cbObj.allLeagues = [];

      var allLeaguesURL = [
          'http://api.thescore.com/liga/leaders?categories=goals',
          'http://api.thescore.com/epl/leaders?categories=goals',
          'http://api.thescore.com/seri/leaders?categories=goals',
          'http://api.thescore.com/chlg/leaders?categories=goals',
          'http://api.thescore.com/uefa/leaders?categories=goals'
        ],
        allLeagues = [ 'liga', 'epl', 'seri', 'chlg', 'uefa' ],
        listOrPromises = [],
        listOfResults = [];

      allLeaguesURL.forEach(function (url, index) {

        var leagueRequest = scope.getData({
          endPointURL: url
        });

        leagueRequest.promise.then(function (result) {

          result.data.goals = result.data.goals.map($arrayLoopers.goalsMap.bind($arrayLoopers, url));
          cbObj[allLeagues[index]] = result.data.goals; // save league data reference to cbObj
          localStorageService.set(allLeagues[index], result.data.goals); // also save to localStorage
          listOfResults.push(result);

        });

        listOrPromises.push(leagueRequest);

      });

      $q.all(listOrPromises.map(function (defer) {

        return defer.promise;

      })).then(function (result) {

        result.forEach(function (league) {
          cbObj.allLeagues = cbObj.allLeagues.concat(league.data.goals);
        });
        localStorageService.set('allLeagues', cbObj.allLeagues); // also save to localStorage
        cbObj.lastCheckDate = $date.create();
        localStorageService.set('lastCheckDate', $date.create());
        cbObj.cb();

      });


      return listOrPromises;

    }

  };

  return scope;

});
