/**
 * Created by crivas on 9/12/2014.
 */


sicklifesFantasy.factory('$apiFactory', function ($http, $q) {

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

  scope.getAllLeagues = function () {

    var allLeagues = [
      'http://api.thescore.com/liga/leaders?categories=goals',
      'http://api.thescore.com/epl/leaders?categories=goals',
      'http://api.thescore.com/seri/leaders?categories=goals',
      'http://api.thescore.com/chlg/leaders?categories=goals',
      'http://api.thescore.com/uefa/leaders?categories=goals'
    ];

    var listOrPromises = [],
      listOfResults = [];

    allLeagues.forEach(function (url, index) {

      var leagueRequest = scope.getData({
        endPointURL: url
      });

      leagueRequest.promise.then(function (result) {

        result.data.goals = result.data.goals.map(function(i) {

          var customResult = i;

          customResult.url = url;

          customResult.league = function () {
            if (url.contains('liga')) {
              return 'liga';
            } else if (url.contains('epl')) {
              return 'epl';
            } else if (url.contains('seri')) {
              return 'seri';
            } else if (url.contains('chlg')) {
              return 'chlg';
            } else if (url.contains('uefa')) {
              return 'uefa';
            } else {
              return 'unknown';
            }

          };

          return customResult;

        });

        listOfResults.push(result);

      });

      listOrPromises.push(leagueRequest);

    });

    return listOrPromises;

  };

  return scope;

});
