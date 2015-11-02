/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('imageTool', function () {

      return {

        convertImgToBase64URL: function (url, callback, outputFormat) {
          var img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = function () {
            var canvas = document.createElement('CANVAS'),
              ctx = canvas.getContext('2d'), dataURL;
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null;
          };
          img.src = url;
        }

      };

    });

})();
