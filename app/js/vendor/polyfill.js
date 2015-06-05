(function () {

  // polyfill
  if (!String.prototype.contains) {
    String.prototype.contains = function () {
      return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }

  angular.isUndefinedOrNull = function (val) {
    return angular.isUndefined(val) || val === null;
  };

})();