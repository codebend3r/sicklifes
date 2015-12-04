/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$apiFactory', function ($http, $q, $localStorage, $moment, $rootScope, $textManipulator, $stateParams) {

      var apiFactory = {};

      /**
       * @description
       * @returns {Promise}
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
       * @description
       * @returns {Promise}
       */
      apiFactory.getApiData = function (namespace) {

        var defer = $q.defer();

        $http.get('https://glaring-fire-9383.firebaseio.com/' + namespace + '.json')
          .then(function (result) {

            //console.log('rootScope variable saved:', namespace, $rootScope[namespace]);
            if (namespace === 'managersData') {
              var managerId = $stateParams.managerId ? $stateParams.managerId : 'chester';
              console.log('managerId:', managerId);
              $rootScope[namespace] = result.data;
              $rootScope.selectedManager = $rootScope.managersData.data[managerId.toLowerCase()];
            } else if (namespace.contains('managersData')) {
              var managerId = $stateParams.managerId ? $stateParams.managerId : 'chester';
              $rootScope['managersData'] = $rootScope[namespace] || {};
              $rootScope['managersData'][managerId] = result.data;
              $rootScope.selectedManager = result.data;
            } else {
              $rootScope[namespace] = result.data;
            }
            console.log('rootScope variable saved:', namespace);
            defer.resolve(result.data);

          });

        return defer.promise;

      };

      /**
       * @description gets players game log and goal per game details
       */
      apiFactory.getPlayerGameDetails = function (league, id) {

        return apiFactory.getData({
          endPointURL: $textManipulator.getPlayerPlayerRecordURL(league, id)
        });

      };

      apiFactory.getPlayerProfileURL = function (leagueSlug, id) {
        return 'http://origin-api.thescore.com/' + leagueSlug.toLowerCase() + '/players/' + id;
      };

      /**
       * gets player's league related data
       */
      apiFactory.getPlayerProfile = function (league, id) {

        return apiFactory.getData({
          endPointURL: apiFactory.getPlayerProfileURL(league, id)
        });

      };

      /**
       * getting league tables
       */
      apiFactory.getLeagueTables = function () {

        var leagues = [
            'http://api.thescore.com/liga/standings/',
            'http://api.thescore.com/epl/standings/',
            'http://api.thescore.com/seri/standings/',
            'http://api.thescore.com/chlg/standings/',
            'http://api.thescore.com/uefa/standings/'
          ],
          leagueSlugs = ['liga', 'epl', 'seri', 'chlg', 'uefa'],
          listOrPromises = [];

        _.each(leagues, function (url, index) {

          var leagueRequest = apiFactory.getData({
            endPointURL: url
          });

          leagueRequest.then(function (result) {
            result.data.leagueURL = url;
            result.data.leagueSlug = leagueSlugs[index];
          });

          listOrPromises.push(leagueRequest);

        });

        return listOrPromises;

      };

      /**
       * getting teamms in all the leagues
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

})();
