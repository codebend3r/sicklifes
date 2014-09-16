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

  return scope;

});
