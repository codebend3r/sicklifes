/**
 * Created by Bouse on 10/24/2014
 */


angular.module('sicklifes')

  .controller('standingsCtrl', function ($scope, $timeout, $apiFactory, $routeParams, $fireBaseService, $updateDataUtils, $objectUtils, $momentService, $managersService, $location) {

    ////////////////////////////////////////
    /////////////// public /////////////////
    ////////////////////////////////////////

    /**
     * whether data is still loading
     */
    $scope.loading = true;

    /**
     * url param - whether admin is true
     */
    $scope.admin = $routeParams.admin;

    /**
     * TODO
     */
    $scope.tableHeader = [
      {
        columnClass: 'col-md-4 col-xs-4 small-hpadding',
        hoverTitle: 'Team',
        text: 'Team'
      },
      {
        columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
        hoverTitle: 'Domestic Goals',
        text: 'DG'
      },
      {
        columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
        hoverTitle: 'Champions League Goals',
        text: 'CLG'
      },
      {
        columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
        hoverTitle: 'Europa League Goals',
        text: 'EG'
      },
      {
        columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
        hoverTitle: 'Total Points',
        text: 'PTS'
      }
    ];

    /**
     * consolidated list of all owned players by a manager
     */
    $scope.allLeagues = null;

    $scope.updateAllManagerData = null;

    ////////////////////////////////////////
    ////////////// private /////////////////
    ////////////////////////////////////////

    /**
     * TODO
     */
    var allRequestComplete = function () {

      console.log('allRequestComplete');

      $scope.loading = false;

    };

    $scope.saveToFireBase = function () {

      console.log('////////////////////////////////////');
      console.log('$scope.managersData', $scope.managersData);
      console.log('////////////////////////////////////');

      var saveObject = {
        _syncedFrom: 'standingsCtrl',
        _lastSyncedOn: $dateService.syncDate(),
        chester: $scope.managersData[0],
        frank: $scope.managersData[1],
        dan: $scope.managersData[2],
        justin: $scope.managersData[3],
        mike: $scope.managersData[4],
        joe: $scope.managersData[5]
      };

      $fireBaseService.syncManagersData(saveObject);

    };

    /**
     * call when firebase data has loaded
     * defines $scope.managersData
     * @param data
     */
    var fireBaseLoaded = function (data) {

      console.log('fireBaseLoaded -- standingsCtrl', data);

      $scope.managersData = [
        data.managersData.chester,
        data.managersData.frank,
        data.managersData.dan,
        data.managersData.justin,
        data.managersData.mike,
        data.managersData.joe
      ];

      //console.log('syncDate allPlayersData', data.allPlayersData._lastSyncedOn);
      //console.log('syncDate leagueData', data.leagueData._lastSyncedOn);
      //console.log('syncDate managersData', data.managersData._lastSyncedOn);

      $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.managersData);

      $scope.loading = false;

    };

    /**
     * init function
     */
    var init = function () {

      $fireBaseService.initialize($scope);
      var firePromise = $fireBaseService.getFireBaseData();
      firePromise.then(fireBaseLoaded);

    };

    $timeout(init, 250);

  });
