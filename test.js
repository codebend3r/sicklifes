var testObject = {
  player: {
    id: {
      value: 43,
      injuries: {
        hello: true
      }
    },
    gameLogs: {
      game1: {
        goals: {

        }
      }
    }
  }
};

_.allHaveProperty = function(obj, key) {

  var maxLevels = key.indexOf('.') !== -1 ? key.split('.').length : 1;
  var level = 0;
  var currentObjectKey = key.split('.')[ level ];
  var parentObj = obj;
  var hasEverything = false;

  var checkObject = function() {
    currentObjectKey = key.indexOf('.') !== -1 ? key.split('.')[ level ] : testKey;
    if (!_.has(parentObj, currentObjectKey)) {
      console.log('FAILED:', currentObjectKey, 'not found');
      return false;
    } else {
      parentObj = parentObj[currentObjectKey];
      level += 1;
      if (level < maxLevels) {
        checkObject();
      } else {
        console.log('PASSED');
        return true;
      }
    }
  };

  return checkObject();

};

var test1 = _.allHaveProperty(testObject, 'player.id.injuries');
console.log(test1);
