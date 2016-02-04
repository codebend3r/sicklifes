/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('chartSettings', function () {

      return {

        /**Ø
         * @name chartOptions
         * @description options for chart
         */
        chartOptions: {
          axisX: {
            labelInterpolationFnc: function (value, index, axis) {
              var divider;
              if (axis.length < 8) {
                divider = 1;
              } else {
                divider = Math.ceil(axis.length / 16);
              }
              if (index % divider === 0) {
                return value;
              } else {
                return '';
              }
            }
          },
          axisY: {
            onlyInteger: true,
            low: 0
          },
          lineSmooth: false,
          fullWidth: false,
          chartPadding: {
            right: 0
          },
          showPoint: true,
          height: 250,
          classNames: {
            chart: 'sick-chart-line ct-chart-line',
            label: 'sick-label ct-label',
            series: 'sick-series ct-series',
            line: 'sick-line ct-line'
          }
        },

        /**
         * @name responsiveOptions
         * @description responsive options for charts
         */
        responsiveOptions: [
          ['screen and (min-width: 641px) and (max-width: 1024px)', {
            lineSmooth: true,
            showPoint: false,
            fullWidth: true,
            height: 400,
            axisX: {
              showLabel: true,
              labelInterpolationFnc: function (value, index, axis) {
                if (index % 4 === 0) {
                  return value;
                } else {
                  return '';
                }
              }
            },
            axisY: {
              onlyInteger: true,
              showLabel: true
            }
          }],
          ['screen and (max-width: 640px)', {
            lineSmooth: true,
            showPoint: false,
            fullWidth: true,
            height: 400,
            axisX: {
              showLabel: true,
              offsetX: 20,
              labelInterpolationFnc: function (value, index, axis) {
                if (index % 12 === 0) {
                  return value;
                } else {
                  return '';
                }
              }
            },
            axisY: {
              onlyInteger: true,
              showLabel: true
            }
          }]
        ],

      }
        ;

    });

})();
