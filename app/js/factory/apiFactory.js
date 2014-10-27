/**
 * Created by Bouse on 10/24/2014
 */
 
sicklifesFantasy.factory('$apiFactory', function ($http, $q, localStorageService, $date, $textManipulator) {

  var scope = {};

  /**
   * TODO
   */
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

  /**
   * TODO
   */
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

  /**
   * TODO
   */
  scope.getPlayerGameDetails = function (league, id) {

    var request = scope.getData({
      endPointURL: $textManipulator.getPlayerPlayerRecordURL(league, id)
    });

    return request;

  };

  /**
   * TODO
   */
  scope.getPlayerProfile = function (league, id) {

    if (typeof league === 'undefined') league = 'soccer';

    var request = scope.getData({
      endPointURL: $textManipulator.getPlayerProfileURL(league, id)
    });

    return request;

  };

  /**
   * TODO
   */
  scope.getAllLeagues = function () {

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

        //result.data.goals = result.data.goals.map($arrayMappers.goalsMap.bind($arrayMappers, url));
        //cbObj[allLeagues[index]] = result.data.goals; // save league data reference to cbObj
        //localStorageService.set(allLeagues[index], result.data.goals); // save each league also save to localStorage
        result.leagueURL = url;
        result.leagueName = allLeagues[index];
        listOfResults.push(result);

      });

      listOrPromises.push(leagueRequest.promise);

    });
    
    return listOrPromises;

  };
  
  scope.listOfPromises = function(list, callbackFunc) {
    
    $q.all(list).then(callbackFunc);
    
  }

  return scope;

});
