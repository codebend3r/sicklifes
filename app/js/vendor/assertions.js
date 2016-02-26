(function () {

  _.hasDeepProperty = function (obj, key) {
    return !Array.isArray(obj) && _.keys(obj).length > 0 && _.every(obj, function (prop) {
        return !angular.isUndefinedOrNull(prop[key]);
      });
  };

  _.allHaveProperty = function(obj, key) {
    return _.every(obj, function(m) {
      return _.every(m.players, function(p) {
        return _.has(p, key);
      });
    });
  };

})();
