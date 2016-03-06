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
  _.allManagersPlayersHave = function(obj, key) {
    return _.every(obj, function(m) {
      return !angular.isUndefinedOrNull(m.players) && _.every(m.players, function(eachPlayer) {
        return !angular.isUndefinedOrNull(eachPlayer[key]);
      });
    });
  };

  /**
   * @name allHaveProperty
   * @description TODO
   */
  // _.allHaveProperty = function(obj, key) {
  //   console.log('allHaveProperty:', key);
  //   var maxLevels = key.indexOf('.') !== -1 && key.split('.').length,
  //     level = 0,
  //     currentObjectKey = key.split('.')[ level ];
  //
  //   if (key.indexOf('.') === -1) {
  //     return !angular.isUndefinedOrNull(obj[key]);
  //   } else {
  //     console.log('with dot seperator');
  //     var checkObject = function(parentObj) {
  //       currentObjectKey = key.indexOf('.') !== -1 ? key.split('.')[ level ] : key;
  //       console.log(parentObj, currentObjectKey);
  //       if (angular.isUndefinedOrNull(parentObj[currentObjectKey])) {
  //         throw new Error('FAILED: could not find property', currentObjectKey, 'in', parentObj);
  //         return false;
  //       } else {
  //         level += 1;
  //         if (level < maxLevels) {
  //           return !angular.isUndefinedOrNull(parentObj[currentObjectKey]) && (console.log(parentObj[currentObjectKey])) && checkObject(parentObj[currentObjectKey]);
  //         } else {
  //           return true;
  //         }
  //       }
  //     };
  //     return checkObject(obj);
  //   };
  // };

})();
