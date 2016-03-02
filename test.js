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

var testKey = 'player.id.injuries';

var allHaveProperty = function(testObject, testKey) {

  var maxLevels = testKey.split('.').length;
  var level = 0;
  var currentObjectKey = testKey.split('.')[ level ];
  var parentObj = testObject;

  var checkObject = function() {
    currentObjectKey = testKey.split('.')[ level ];
    //console.log(parentObj, 'has', currentObjectKey, _.has(parentObj, currentObjectKey));
    if (_.has(parentObj, currentObjectKey)) {
      parentObj = parentObj[currentObjectKey];
    }
    level += 1;
    if (level < maxLevels) {
      checkObject();
    }
  };

  checkObject();

};

hasId();
