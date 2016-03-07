(function () {

  /**
   * @name hasDeepProperty
   * @description TODO
   */
  _.hasDeepProperty = function (obj, key) {
    return !Array.isArray(obj) && _.keys(obj).length > 0 && _.every(obj, function (prop) {
        return !angular.isUndefinedOrNull(prop[key]);
      });
  };

  /**
   * @name allManagersPlayersHave
   * @description loops through all players keys on each object and then loops through every sub object defined by key
   */
  _.allManagersPlayersHave = function (obj, key) {
    return _.every(obj, function (m) {
      return !angular.isUndefinedOrNull(m.players) && _.every(m.players, function (eachPlayer) {
          return !angular.isUndefinedOrNull(eachPlayer[key]);
        });
    });
  };

  /**
   * @name allHaveProperty
   * @description will recursively check all manager data for a specific key
   * @param obj - target object for inspection
   * @param key - a single key value or multiple key values as a string delmited by a dot
   */
  _.allHaveProperty = function (obj, key) {

    return _.every(obj, function (m) {

      return !angular.isUndefinedOrNull(m.players) && _.every(m.players, function (eachPlayer) {

        if (key.indexOf('.') !== -1) {

          var maxLevels = key.split('.').length,
            level = 0,
            currentObjectKey = key.split('.')[level];

          var checkObject = function (parentObj, childKey) {
            //console.log('checking for', childKey, 'in', parentObj);
            if (angular.isUndefinedOrNull(parentObj[childKey])) {
              console.warn('FAILED: could not find property \'', childKey, '\' in', parentObj);
              return false;
            } else {
              level += 1;
              if (level < maxLevels) {
                return !angular.isUndefinedOrNull(parentObj[childKey]) && checkObject(parentObj[childKey], key.split('.')[level]);
              } else {
                return true;
              }
            }
          };
          return checkObject(eachPlayer, currentObjectKey);
        } else {
          return !angular.isUndefinedOrNull(eachPlayer[key]);
        }
      });

    });

  };

})();
