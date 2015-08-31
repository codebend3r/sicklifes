/**
 * Created by Bouse on 08/29/2015
 */

angular.module('sicklifes')

  .controller('tablesCtrl', function ($scope, $http, $stateParams, $updateDataUtils, $textManipulator, $momentService, $localStorage) {

    console.log('--> tablesCtrl');

    /**
     * header for custom-table directive
     */
    $scope.leagueTableHeader = [
      {
        columnClass: 'col-md-1 col-sm-2 col-xs-2 text-center small-hpadding',
        text: 'Rank'
      },
      {
        columnClass: 'col-md-6 col-sm-4 col-xs-6 small-hpadding',
        text: 'Team'
      },
      {
        columnClass: 'col-md-1 col-sm-4 hidden-xs text-center small-hpadding',
        text: 'Record'
      },
      {
        columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
        text: 'GP'
      },
      {
        columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
        text: 'F'
      },
      {
        columnClass: 'col-md-1 hidden-sm hidden-xs text-center small-hpadding',
        text: 'A'
      },
      {
        columnClass: 'col-md-1 col-sm-2 col-xs-4 text-center small-hpadding',
        text: 'Points'
      }
    ];

    ////////////////////////////////////////
    ////////////// private /////////////////
    ////////////////////////////////////////

    /**
     * init
     */
    var init = function () {

      console.log('tablesCtrl - init');
      console.log('> leagueName', $stateParams.leagueName);

    };

    init();

  });
