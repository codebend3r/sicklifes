(function () {

  _.hasDeepProperty = function (obj, key) {
    return !Array.isArray(obj) && _.keys(obj).length > 0 && _.every(obj, function (prop) {
        return !angular.isUndefinedOrNull(prop[key]);
      });
  };

  _.allHaveProperty = function(obj, key) {
    var maxLevels = key.indexOf('.') !== -1 ? key.split('.').length : 1,
      level = 0,
      currentObjectKey = key.split('.')[ level ];
    if (maxLevels === 1) {
      return _.has(obj, key);
    } else {
      var checkObject = function(parentObj) {
        currentObjectKey = key.indexOf('.') !== -1 ? key.split('.')[ level ] : key;
        if (!_.has(parentObj, currentObjectKey)) {
          console.log('FAILED: could not find property', currentObjectKey, 'in', parentObj);
          debugger;
          return false;
        } else {
          level += 1;
          if (level < maxLevels) {
            return checkObject(parentObj[currentObjectKey]);
          } else {
            return true;
          }
        }
      };
      return checkObject(obj);
    }
  };

})();
