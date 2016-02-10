/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('chartSettings', function () {

      return {

        /**
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
          //lineSmooth: true,
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 4,
            fillHoles: true
          }),
          fullWidth: true,
          chartPadding: {
            right: 0
          },
          showPoint: false,
          height: 250,
          classNames: {
            chart: 'sick-chart-line ct-chart-line',
            label: 'sick-label ct-label',
            series: 'sick-series ct-series',
            line: 'sick-line ct-line'
          }
        },

        /**
         * @name chartOptions
         * @description options for chart
         */
        profileChartOptions: {
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
          //lineSmooth: true,
          lineSmooth: Chartist.Interpolation.simple(),
          //lineSmooth: Chartist.Interpolation.simple({
          //  divisor: 4,
          //  fillHoles: true
          //}),
          //series: {
          //  'goals': {
          //    lineSmooth: Chartist.Interpolation.step()
          //  },
          //  'shots': {
          //    lineSmooth: Chartist.Interpolation.simple()
          //  },
          //  'shotsOnGoal': {
          //    showPoint: false
          //  },
          //},
          fullWidth: true,
          chartPadding: {
            right: 0
          },
          showPoint: false,
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
            fullWidth: true,
            axisX: {
              showLabel: true,
              labelInterpolationFnc: function (value, index, axis) {
                var divider;
                if (axis.length < 8) {
                  divider = 1;
                } else {
                  divider = Math.ceil(axis.length / 10);
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
              showLabel: true
            }
          }],
          ['screen and (max-width: 640px)', {
            //chartPadding: {
            //  top: 10,
            //  right: 10,
            //  bottom: 10,
            //  left: 10
            //},
            fullWidth: true,
            axisX: {
              showLabel: true,
              labelInterpolationFnc: function (value, index, axis) {
                var divider;
                divider = Math.ceil(axis.length / 5);
                if (index % divider === 0) {
                  return value;
                } else {
                  return '';
                }
              }
            },
            axisY: {
              labelOffset: {
                x: 0,
                y: 0
              }
            }
          }]
        ],

      }
        ;

    });

})();
