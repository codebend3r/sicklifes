/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('standingsCtrl', function ($scope, $timeout, $apiFactory, $routeParams, $fireBaseService, $updateDataUtils, $objectUtils, $dateService, $managersService, $location) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  /**
   * TODO
   */
  $scope.loading = true;

  $scope.chartConfig = {
    chart: {
      type: 'line'
    },
    title: {
      text: null
    },
    subtitle: {
      text: null
    },
    xAxis: {
      categories: ['Sep 2014', 'Oct 2014', 'Nov 2014', 'Dec 2014', 'Jan 2015', 'Feb 2015', 'Mar 2015', 'Apr 2015', 'May 2015']
    },
    yAxis: {
      title: {
        text: 'Total Goals'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Tokyo',
      data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
    }, {
      name: 'London',
      data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
    }]
  };

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

  var populateChart = function () {

    $scope.chartConfig.series = [];

    console.log('$scope.allManagers', $scope.allManagers);

    $scope.allManagers.forEach(function (manager) {

      $scope.chartConfig.series.push({
        name: manager.managerName,
        data: []
      });

      console.log($scope.chartConfig.series);
      console.log($scope.chartConfig.series.data);

      var n = $scope.chartConfig.series.length;
      var p = $scope.chartConfig.series[n].data[0].length;

      var currentData = $scope.chartConfig.series[n];

      //console.log('manager', manager);
      manager.monthlyGoalsLog.forEach(function (game) {

        console.log('datePlayed', game.datePlayed);
        console.log('goals', currentData);
        currentData.push(currentData);

      });


    });

  };

  /**
   * TODO
   */
  var allRequestComplete = function () {

    console.log('allRequestComplete');

    $scope.loading = false;

  };

  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'standingsCtrl',
      _lastSyncedOn: $dateService.syncDate(),
      chester: $scope.allManagers[0],
      frank: $scope.allManagers[1],
      dan: $scope.allManagers[2],
      justin: $scope.allManagers[3],
      mike: $scope.allManagers[4],
      joe: $scope.allManagers[5]
    };

    $fireBaseService.syncLeagueTeamData(saveObject);

  };

  /**
   * call when firebase data has loaded
   * defines $scope.allManagers
   * @param data
   */
  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded -- standingsCtrl');

    $scope.allManagers = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    console.log('syncDate allPlayersData', data.allPlayersData._lastSyncedOn);
    console.log('syncDate leagueData', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData', data.managersData._lastSyncedOn);

    $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.allManagers);

    populateChart();

    $scope.loading = false;

  };

  /**
   * init function
   */
  var init = function () {

    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded);

  };

  $timeout(init, 250);

});
