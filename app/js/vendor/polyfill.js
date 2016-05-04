(function () {

  'use strict';

  // polyfill
  if (!String.prototype.contains) {
    String.prototype.contains = function () {
      return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }

  if (!String.prototype.capitalize) {
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };
  }

  _.isDefined = function (val) {
    return !_.isUndefined(val) && !_.isNull(val);
  };

  _.isFalsey = function(val) {
    return _.isUndefined(val) || _.isNull(val) || (typeof val === 'string' && val.trim() === '');
  };

})();
