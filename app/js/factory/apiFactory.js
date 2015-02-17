/**
 * Created by Bouse on 10/24/2014
 */

sicklifesFantasy.factory('$apiFactory', function ($http, $q, localStorageService, $date, $textManipulator) {

  var apiFactory = {};

  /**
   * TODO
   */
  apiFactory.getData = function (endPoint) {

    var defer = $q.defer(),
      httpObject = {
        method: endPoint.method || 'GET',
        url: endPoint.endPointURL
      };

    $http(httpObject).then(function (result) {

      defer.resolve(result);
      if (angular.isDefined(endPoint.qCallBack)) endPoint.qCallBack(result);

    });

    return defer.promise;

  };

  /**
   * TODO
   */
  apiFactory.getFromLocalStorage = function (cbObj) {

    console.log('get from localStorage');

    var currentDate = $date.create(),
      lDate = localStorageService.get('lastCheckDate');

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
   * gets players game log and goal per game details
   */
  apiFactory.getPlayerGameDetails = function (league, id) {

    var request = apiFactory.getData({
      endPointURL: $textManipulator.getPlayerPlayerRecordURL(league, id)
    });

    return request;

  };

  /**
   * gets player's league related data
   */
  apiFactory.getPlayerProfile = function (league, id) {

    league === 'soccer' ? console.log('1. getPlayerProfile') : console.log('3. getPlayerProfile');

    if (typeof league === 'undefined') league = 'soccer';

    return apiFactory.getData({
      endPointURL: $textManipulator.getPlayerProfileURL(league, id)
    });

  };

  /**
   * TODO
   */
  apiFactory.getAllTeams = function () {

    var allLeaguesURL = [
        {
          url: 'http://origin-api.thescore.com/liga/teams/',
          leagueName: 'liga'
        },
        {
          url: 'http://origin-api.thescore.com/epl/teams/',
          leagueName: 'epl'
        },
        {
          url: 'http://origin-api.thescore.com/seri/teams/',
          leagueName: 'seri'
        },
        {
          url: 'http://origin-api.thescore.com/chlg/teams/',
          leagueName: 'chlg'
        },
        {
          url: 'http://origin-api.thescore.com/uefa/teams/',
          leagueName: 'uefa'
        }
      ],
      listOrPromises = [];

    allLeaguesURL.forEach(function (urlObj) {

      var leagueRequest = apiFactory.getData({
        endPointURL: urlObj.url
      });

      leagueRequest.promise.then(function (result) {

        result.leagueURL = urlObj.url;
        result.leagueName = urlObj.leagueName;

      });

      listOrPromises.push(leagueRequest.promise);

    });

    return listOrPromises;

  };

  /**
   * TODO
   */
  apiFactory.getRoster = function (result) {

    var listOrPromises = [];

    result.data.forEach(function (leagueData) {

      var rosterRequest = apiFactory.getData({
        endPointURL: url + leagueData.id + '/players/'
      });

      rosterRequest.promise.then(function () {

        listOrPromises.push(rosterRequest.promise);

      });

    });

  };

  /**
   * TODO
   */
  apiFactory.getAllGoalLeaders = function () {

    var allLeaguesURL = [
        'http://api.thescore.com/liga/leaders?categories=goals',
        'http://api.thescore.com/epl/leaders?categories=goals',
        'http://api.thescore.com/seri/leaders?categories=goals',
        'http://api.thescore.com/chlg/leaders?categories=goals',
        'http://api.thescore.com/uefa/leaders?categories=goals'
      ],
      allLeagues = ['liga', 'epl', 'seri', 'chlg', 'uefa'],
      listOrPromises = [],
      listOfResults = [];

    allLeaguesURL.forEach(function (url, index) {

      var leagueRequest = apiFactory.getData({
        endPointURL: url
      });

      leagueRequest.promise.then(function (result) {

        result.leagueURL = url;
        result.leagueName = allLeagues[index];
        listOfResults.push(result);

      });

      listOrPromises.push(leagueRequest.promise);

    });

    return listOrPromises;

  };

  /**
   * waits for an array of promises to resolve
   */
  apiFactory.listOfPromises = function (list, callbackFunc) {

    $q.all(list).then(callbackFunc);

  };

  return apiFactory;

});
