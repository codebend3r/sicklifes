/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('apiFactory', function ($http, $q, $moment, $rootScope) {

      var apiFactory = {};

      apiFactory.baseUrl = 'http://api.thescore.com/';

      apiFactory.firebaseUrl = 'https://glaring-fire-9383.firebaseio.com/';

      apiFactory.slugs = ['liga', 'epl', 'seri', 'chlg', 'uefa'],

      /**
       * @description
       * @returns {Promise}
       */
        apiFactory.getApiData = function (namespace) {

          var defer = $q.defer();

          $http.get(apiFactory.firebaseUrl + namespace + '.json')
            .then(function (result) {
              $rootScope[namespace] = result.data;
              console.log('rootScope variable saved:', namespace);
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
       */
      apiFactory.getLeagueTables = function () {

        var listOrPromises = [];

        _.each(apiFactory.slugs, function (slug) {

          var leagueRequest = apiFactory.getTablesByLeague(slug);

          leagueRequest.then(function (result) {
            result.slug = slug;
          });

          listOrPromises.push(leagueRequest);

        });

        return listOrPromises;

      };

      /**
       * @description get teams in specific league by slug
       */
      apiFactory.getTeamsByLeague = function (slug) {
        return $http.get(apiFactory.baseUrl + slug + '/teams');
      };

      /**
       * @description getting teams in all the leagues
       */
      apiFactory.getAllTeams = function () {

        var listOrPromises = [];

        _.each(apiFactory.slugs, function (slug) {

          var leagueRequest = apiFactory.getTeamsByLeague(slug);

          leagueRequest.then(function (result) {
            result.slug = slug;
          });

          listOrPromises.push(leagueRequest);

        });

        return listOrPromises;

      };

      /**
       * @description make http request for current league leader in goals
       * @param cb
       */
      apiFactory.getGoalLeadersByLeague = function (slug) {
        return $http.get(apiFactory.baseUrl + slug + '/leaders?categories=Goals&season_type=regular');
      };

      /**
       * @description TODO
       */
      apiFactory.getAllGoalLeaders = function () {

        var listOrPromises = [];

        _.each(apiFactory.slugs, function (slug) {

          var leagueRequest = apiFactory.getGoalLeadersByLeague(slug);

          leagueRequest.then(function (result) {
            result.slug = slug;
          });

          listOrPromises.push(leagueRequest);

        });

        return $q.all(listOrPromises);

      };

      /**
       * @description
       */
      //apiFactory.getRoster = function (result) {
      //
      //  var listOrPromises = [];
      //
      //  _.each(result.data, function (leagueData) {
      //
      //    var rosterRequest = apiFactory.getData({
      //      endPointURL: url + leagueData.id + '/players/'
      //    });
      //
      //    rosterRequest.promise.then(function () {
      //      listOrPromises.push(rosterRequest.promise);
      //    });
      //
      //  });
      //
      //};


      return apiFactory;

    });

})();
