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
   * @description TODO
   */
  _.allManagersPlayersHave = function(obj, key) {
    return _.every(obj, function(m) {
      if (_.isUndefined(m.players)) {
        console.log('this manager does not have players', m);
        throw new Error('this player does have the property', key, p.player.name);
      };
      return !_.isUndefined(m.players) && _.every(m.players, function(p) {
        return _.allHaveProperty(p, key);
      });
    });
  };

  /**
   * @name allHaveProperty
   * @description TODO
   */
  _.allHaveProperty = function(obj, key) {
    var maxLevels = key.indexOf('.') !== -1 ? key.split('.').length : 1,
      level = 1,
      currentObjectKey = key.split('.')[ level ];

    if (maxLevels === 1) {
      return angular.isUndefinedOrNull(obj[key]);
    } else {
      var checkObject = function(parentObj) {
        currentObjectKey = key.indexOf('.') !== -1 ? key.split('.')[ level ] : key;
        if (angular.isUndefinedOrNull(parentObj[currentObjectKey])) {
          console.log('FAILED: could not find property', currentObjectKey, 'in', parentObj);
          debugger;
          return false;
        } else {
          level += 1;
          if (level < maxLevels) {
            return !angular.isUndefinedOrNull(parentObj[currentObjectKey]) && (console.log(parentObj[currentObjectKey])) && checkObject(parentObj[currentObjectKey]);
          } else {
            return true;
          }
        }
      };
      return checkObject(obj);
    };
  };

})();
