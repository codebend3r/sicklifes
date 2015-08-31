/**
 * Created by Bouse on 08/29/2015
 */

angular.module('sicklifes')

  .controller('tablesCtrl', function ($scope, $http, $stateParams, $updateDataUtils, $textManipulator, $momentService, $localStorage) {

    console.log('--> tablesCtrl');

    ////////////////////////////////////////
    ////////////// private /////////////////
    ////////////////////////////////////////

    /**
     * init
     */
    var init = function () {

      console.log('tablesCtrl - init');
      console.log('> leagueName', $stateParams.leagueName);

      //if (angular.isDefined($rootScope[dataKeyName])) {
      //
      //  console.log('load from $rootScope');
      //  $scope.loadFromLocal($rootScope[dataKeyName]);
      //
      //} else if (angular.isDefined($localStorage[dataKeyName])) {
      //
      //  console.log('load from local storage');
      //  $scope.loadFromLocal($localStorage[dataKeyName]);
      //
      //} else {
      //
      //  console.log('load from firebase');
      //  $scope.startFireBase(fireBaseLoaded);
      //
      //}

    };

    init();

  });
