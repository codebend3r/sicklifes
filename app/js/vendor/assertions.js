(function () {

  _.hasDeepProperty = function (obj, key) {

    return !Array.isArray(obj) && _.keys(obj).length > 0 && _.every(obj, function (prop) {

        return !angular.isUndefinedOrNull(prop[key]);

      });

  };

})();
