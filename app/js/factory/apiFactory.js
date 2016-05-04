/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('apiFactory', function ($http, $q, $moment, $rootScope, $log) {

      var apiFactory = {
        leagueSlugs: ['liga', 'epl', 'seri', 'chlg', 'uefa'],
        baseUrl: 'http://api.thescore.com/',
        firebaseUrl: 'https://glaring-fire-9383.firebaseio.com/'
      };

      /**
       * @name getApiData
       * @description makes a request from the firebase api by namespace and saves the response to the $rootScope
       *      supported requests are:
       *           - managerData
       *           - managerCore
       *           - leagueLeaders
       *           - leagueTables
       * @returns {Promise}
       */
        apiFactory.getApiData = function (namespace) {
          var defer = $q.defer();
          $http.get(apiFactory.firebaseUrl + namespace + '.json', { cache: true })
            .then(function (result) {
              $rootScope[namespace] = result.data;
              $log.debug('rootScope variable saved:', namespace);
              defer.resolve(result.data);

            });
          return defer.promise;
        };

      /**
       * @name getPlayerLog
       * @description gets players game log and goal per game details
       * @returns {promise}
       */
      apiFactory.getPlayerLog = function (leagueSlug, id) {
        return $http.get(apiFactory.baseUrl + leagueSlug.toLowerCase() + '/players/' + id + '/player_records');
      };

      /**
       * @name getPlayerProfile
       * @description gets player's league related data
       * @returns {promise}
       */
      apiFactory.getPlayerProfile = function (leagueSlug, id) {
        return $http.get(apiFactory.baseUrl + leagueSlug.toLowerCase() + '/players/' + id);
      };

      /**
       * @name getTablesByLeague
       * @description TODO
       * @returns {promise}
       */
      apiFactory.getTablesByLeague = function (slug) {
        return $http.get(apiFactory.baseUrl + slug + '/standings');
      };

      /**
       * @name getLeagueTables
       * @description getting league tables
       * @returns {promise}
       */
      apiFactory.getLeagueTables = function () {
        var listOrPromises = [];
        _.each(apiFactory.leagueSlugs, function (slug) {
          var leagueRequest = apiFactory.getTablesByLeague(slug);
          leagueRequest.then(function (result) {
            result.slug = slug;
          });
          listOrPromises.push(leagueRequest);
        });
        return $q.all(listOrPromises);
      };

      /**
       * @name getTeamsByLeague
       * @description get teams in specific league by slug
       * @returns {promise}
       */
      apiFactory.getTeamsByLeague = function (slug) {
        return $http.get(apiFactory.baseUrl + slug + '/teams');
      };

      /**
       * @name getTeamRosterURL
       * @description get roster for specific team by league slug and team id
       * @returns {promise}
       */
      apiFactory.getTeamRosterURL = function (slug, id) {
        return $http.get(apiFactory.baseUrl + slug.toLowerCase() + '/teams/' + id + '/players/?rpp=-1');
      };

      /**
       * @name getAllTeams
       * @description loops through league leagueSlugs and makes a request for all teams in each league
       * @returns {promise}
       */
      apiFactory.getAllTeams = function () {
        var listOrPromises = [];
        _.each(apiFactory.leagueSlugs, function (slug) {
          var leagueRequest = apiFactory.getTeamsByLeague(slug);
          leagueRequest.then(function (result) {
            result.slug = slug;
          });
          listOrPromises.push(leagueRequest);
        });
        return $q.all(listOrPromises);
      };

      /**
       * @name getGoalLeadersByLeague
       * @description get goal leaders by league slug
       * @param cb
       */
      apiFactory.getGoalLeadersByLeague = function (slug) {
        return $http.get(apiFactory.baseUrl + slug + '/leaders?categories=Goals&season_type=regular');
      };

      /**
       * @name getAllGoalLeaders
       * @description loops through league slugs and makes a request for goal leaders in each league
       * @returns {promise}
       */
      apiFactory.getAllGoalLeaders = function () {
        var listOrPromises = [];
        _.each(apiFactory.leagueSlugs, function (slug) {
          var leagueRequest = apiFactory.getGoalLeadersByLeague(slug);
          leagueRequest.then(function (result) {
            result.slug = slug;
          });
          listOrPromises.push(leagueRequest);
        });
        return $q.all(listOrPromises);
      };


      return apiFactory;

    });

})();
