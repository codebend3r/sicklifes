/**
 * Created by Bouse on 10/24/2014
 */

angular.module('sicklifes')

  .factory('$apiFactory', function ($http, $q, $localStorage, $moment, $textManipulator) {

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
    // apiFactory.getFromLocalStorage = function (cbObj) {
    //
    //   console.log('get from localStorage');
    //
    //   var currentDate = $moment.create(),
    //     lDate = $localStorage.get('lastCheckDate');
    //
    //   cbObj.allLeagues = $localStorage.get('allLeagues');
    //   cbObj.liga = $localStorage.get('liga');
    //   cbObj.epl = $localStorage.get('epl');
    //   cbObj.seri = $localStorage.get('seri');
    //   cbObj.chlg = $localStorage.get('chlg');
    //   cbObj.uefa = $localStorage.get('uefa');
    //   cbObj.cb();
    //
    //   return [];
    //
    // };

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

      //league === 'soccer' ? console.log('1. getPlayerProfile') : console.log('3. getPlayerProfile');

      if (angular.isUndefinedOrNull(league) || league === '') {
        league = 'soccer';
      }

      return apiFactory.getData({
        endPointURL: $textManipulator.getPlayerProfileURL(league, id)
      });

    };

    /**
     * getting league tables
     */
    apiFactory.getLeagueTables = function () {

      // var leagues = [
      //     'http://api.thescore.com/liga/standings/1643', // 2015-2016
      //     'http://api.thescore.com/epl/standings/1586', // 2015-2016
      //     'http://api.thescore.com/seri/standings/1288', // 2014-2015
      //     'http://api.thescore.com/chlg/standings/1319', // 2014-2015
      //     'http://api.thescore.com/uefa/standings/1353' // 2014-2015
      //   ],
      var leagues = [
          'http://api.thescore.com/liga/standings/',
          'http://api.thescore.com/epl/standings/',
          'http://api.thescore.com/seri/standings/',
          'http://api.thescore.com/chlg/standings/',
          'http://api.thescore.com/uefa/standings/'
        ],
        listOrPromises = [];

      _.each(leagues, function (url) {

        var leagueRequest = apiFactory.getData({
          endPointURL: url
        });

        leagueRequest.then(function (result) {

          result.data.leagueURL = url;

        });

        listOrPromises.push(leagueRequest);


      });

      return listOrPromises;

    };

    /**
     * getting teamms in all the leagues
     */
    apiFactory.getAllTeams = function () {

      console.log('getting teamms in all the leagues');

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

      _.each(allLeaguesURL, function (urlObj) {

        var leagueRequest = apiFactory.getData({
          endPointURL: urlObj.url
        });

        leagueRequest.then(function (result) {

          result.leagueURL = urlObj.url;
          result.leagueName = urlObj.leagueName;

        });

        listOrPromises.push(leagueRequest);

      });

      return listOrPromises;

    };

    /**
     * TODO
     */
    apiFactory.getRoster = function (result) {

      var listOrPromises = [];

      _.each(result.data, function (leagueData) {

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

      console.log('getting goal leaders in each league');

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

      _.each(allLeaguesURL, function (url, index) {

        console.log('url:', url);

        var leagueRequest = apiFactory.getData({
          endPointURL: url
        });

        leagueRequest.then(function (result) {

          result.leagueURL = url;
          result.leagueName = allLeagues[index];
          listOfResults.push(result);

        });

        listOrPromises.push(leagueRequest);

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
