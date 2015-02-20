/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('standingsCtrl', function ($scope, $timeout, $apiFactory, $routeParams, $fireBaseService, $updateDataUtils, $objectUtils, $dateService, $managersService, $location) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  var oneDayInMill = 86400000;
  var weekInMill = 604800000;

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
      borderWidth: 0,
      gridLineWidth: 0,
      categories: [],
      tickPixelInterval: 1000,
      //categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      //tickInterval: 10,
      tickInterval: null,
      //tickPositions: [],
      /*labels: {
       enabled: true,
       step: 10,
       formatter: function () {
       debugger;
       return $dateService.goalDate(this.value);
       }
       },*/
      title: {
        text: null
      }
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
    series: [
      {
        name: 'Chester',
        data: [
          {
            x: '10/29/14',
            y: Math.round(Math.random() * 10),
            time: '10/29/14'
          },
          {
            x: '11/05/14',
            y: Math.round(Math.random() * 10),
            time: '11/05/14'
          },
          {
            x: '11/16/14',
            y: Math.round(Math.random() * 10),
            time: '11/16/14'
          },
          {
            x: '11/21/14',
            y: Math.round(Math.random() * 10),
            time: '11/21/14'
          },
          {
            x: '11/28/14',
            y: Math.round(Math.random() * 10),
            time: '11/28/14'
          },
          {
            x: '12/02/14',
            y: Math.round(Math.random() * 10),
            time: '12/02/14'
          }

        ]
        //data: []
      }
      /*{
        name: 'Frank',
        data: [
          {
            x: 1408939200000 + (oneDayInMill * 5),
            y: Math.round(Math.random() * 10),
            time: '11/29/14'
          },
          {
            x: 1408939200000 + (oneDayInMill * 15),
            y: Math.round(Math.random() * 10),
            time: '11/29/14'
          },
          {
            x: 1408939200000 + (oneDayInMill * 20),
            y: Math.round(Math.random() * 10),
            time: '11/29/14'
          },
          {
            x: 1408939200000 + (oneDayInMill * 25),
            y: Math.round(Math.random() * 10),
            time: '11/29/14'
          }
        ]
        //data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
      }*/
    ]
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

  var mapGoalDates = function (tickPositions, element, index) {

    var managers = [
      {
        name: 'Joe'
      },
      {
        name: 'Chester'
      },
      {
        name: 'Frank'
      },
      {
        name: 'Dan'
      },
      {
        name: 'Justin'
      },
      {
        name: 'Mike'
      }
    ];

    var evenTick = true;

    return {
      index: index,
      //statusIndex: statusInt,
      time: $dateService.goalDate(element.data.x),
      name: managers[index].name,
      //color: $highChartsSettings.colors[statusInt],
      data: element.data.map(function (d, barIndex) {
        if (!index && evenTick) tickPositions.push(d.x);
        evenTick = !evenTick;
        return {
          x: d.x,
          y: d.y,
          time: $dateService.goalDate(d.x),
          barIndex: barIndex
        };
      })
    };

  };


  /**
   * consolidated list of all owned players by a manager
   */
  $scope.allLeagues = null;

  $scope.updateAllManagerData = null;

  ////////////////////////////////////////
  ////////////// private /////////////////
  ////////////////////////////////////////

  var populateChart = function () {

    //console.log('$scope.managersData', $scope.managersData);

    //$scope.chartConfig.series = data.map(mapGoalDates.bind($scope, $scope.sparkline.options.xAxis.tickPositions));

    /*$scope.managersData.forEach(function (manager) {

     //console.log('managerName', manager.managerName);

     var currentData = [];

     var dateInLoop;

     */
    /*var dataObj = {
     name: manager.managerName,
     data: currentData
     };*/
    /*

     });*/

    $scope.chartConfig.xAxis.categories = [];

    var weekInMill = 604800000;
    //var startDate = '09/01/2014';
    var startDate = $dateService.getDate();
    var startDateInMilli = $dateService.getUnixTime(startDate);
    var nextWeekInMill = startDateInMilli;

    for (var i = 0; i < 10; i++) {
      if (!i) {
        //$scope.chartConfig.xAxis.categories.push(formattedWeek);
        $scope.chartConfig.xAxis.categories.push(startDateString);
      } else {
        nextWeekInMill += weekInMill;
        console.log('nextWeekInMill', nextWeekInMill);
        var nextWeekDate = $dateService.getDate(nextWeekInMill);
        var nextWeekFormatted = $dateService.chartDate(nextWeekDate);
        //$scope.chartConfig.xAxis.categories.push(nextWeekInMill);
        $scope.chartConfig.xAxis.categories.push(nextWeekFormatted);
        debugger;
      }
    }

    /*var goalsObject = {};

     $scope.managersData[0].monthlyGoalsLog.forEach(function (game) {

     var unixTime = $dateService.getUnixTime(game.datePlayed);
     if (angular.isUndefined(goalsObject[unixTime])) {
     goalsObject[unixTime] = {
     goalsScored: game.goalsScored,
     dateValue: game.datePlayed,
     unixTime: unixTime
     };
     } else {
     //console.log('goal already score on', game.datePlayed, ', adding', game.goalsScored);
     goalsObject[unixTime].goalsScored += game.goalsScored;
     }
     });
     */

    /*var goalsArray = _.chain(goalsObject)
     .map(function (val) {
     return val;
     })
     .sortBy(function (g) {
     return g.unixTime;
     });

     console.log('goalsArray:', goalsArray);
     console.log('first value:', goalsArray.first().value());*/

    /*$scope.chartConfig.series[0].data = _.map(goalsArray, function (totalGoalsOnDate, index) {

     return {
     name: $dateService.chartDate(totalGoalsOnDate.unixTime),
     y: totalGoalsOnDate.goalsScored,
     x: totalGoalsOnDate.unixTime
     };

     });*/

    //$scope.chartConfig.xAxis.categories.sort();
    //console.log('$scope.chartConfig.xAxis.categories', $scope.chartConfig.xAxis.categories);
    console.log('$scope.chartConfig.series[0].data', $scope.chartConfig.series[0].data);
    console.log('$scope.chartConfig.xAxis.categories', $scope.chartConfig.xAxis.categories);
    //console.log('goalsObject', goalsObject);

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

    console.log('fireBaseLoaded -- standingsCtrl');

    $scope.managersData = [
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

    $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData.bind($scope, $scope.managersData);

    //populateChart();

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