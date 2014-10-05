/**
 * Created by crivas on 9/12/2014.
 */


sicklifesFantasy.factory('$apiFactory', function ($http, $q, localStorageService, $arrayLoopers, $date, $textManipulator) {

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

  scope.getFromLocalStorage = function (cbObj) {

    console.log('get from localStorage');

    var currentDate = $date.create(),
      lDate = localStorageService.get('lastCheckDate'),
      lastDate = Date.create(lDate);

    cbObj.allLeagues = localStorageService.get('allLeagues');
    cbObj.liga = localStorageService.get('liga');
    cbObj.epl = localStorageService.get('epl');
    cbObj.seri = localStorageService.get('seri');
    cbObj.chlg = localStorageService.get('chlg');
    cbObj.uefa = localStorageService.get('uefa');
    cbObj.cb();

    return [];

  };

  scope.getPlayerGameDetails = function (league, id) {

    var request = scope.getData({
      method: 'GET',
      endPointURL: $textManipulator.getPlayerPlayerRecordURL(league, id)
    });

    return request;

  };

  scope.getPlayerProfile = function (league, id) {

    if (typeof league === 'undefined') league = 'soccer';

    var request = scope.getData({
      method: 'GET',
      endPointURL: $textManipulator.getPlayerProfileURL(league, id)
    });

    return request;

  };

  scope.getAllLeagues = function (cbObj) {

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
        method: 'GET',
        endPointURL: url
      });

      leagueRequest.promise.then(function (result) {

        result.data.goals = result.data.goals.map($arrayLoopers.goalsMap.bind($arrayLoopers, url));
        cbObj[allLeagues[index]] = result.data.goals; // save league data reference to cbObj
        localStorageService.set(allLeagues[index], result.data.goals); // save each league also save to localStorage
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
      cbObj.cb();

    });


    return listOrPromises;

  };

  return scope;

});
