(function () {

  // polyfill
  if (!String.prototype.contains) {
    String.prototype.contains = function () {
      return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }

  if (!String.prototype.capitalize) {
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }
  }

  angular.isUndefinedOrNull = function (val) {
    return angular.isUndefined(val) || val === null;
  };

})();
