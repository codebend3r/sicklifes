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
      borderWidth: 0,
      gridLineWidth: 0,
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      //tickPositions: [],
      /*labels: {
       enabled: true,
       step: 1,
       formatter: function () {
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
    series: [{
      name: 'Chester',
      data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
    }, {
      name: 'Frank',
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

    //console.log('$scope.allManagers', $scope.allManagers);

    //$scope.chartConfig.series = data.map(mapGoalDates.bind($scope, $scope.sparkline.options.xAxis.tickPositions));

    /*$scope.allManagers.forEach(function (manager) {

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
    var nextWeekInMill = startDate;

    //var unixTime = $dateService.getUnixTime(game.datePlayed);

    for (var i = 0; i < 28; i++) {
      if (!i) {
        $scope.chartConfig.xAxis.categories.push(startDate);
      } else {
        nextWeekInMill += weekInMill;
        console.log('nextWeekInMill', nextWeekInMill);
        var nextWeekDate = $dateService.getDate(nextWeekInMill);
        var nextWeekFormatted = $dateService.chartDate(nextWeekDate);
        $scope.chartConfig.xAxis.categories.push(nextWeekFormatted);
      }
    }

    $scope.allManagers[0].monthlyGoalsLog.forEach(function (game) {

      //console.log('playerName', game.playerName);
      //console.log('datePlayed', game.datePlayed);
      //console.log('goals', game.goalsScored)


      /*//if (!duplicateDateInList(unixTime, $scope.chartConfig.xAxis.categories)) {
       if (!duplicateDateInList(game.datePlayed, $scope.chartConfig.xAxis.categories)) {
       //$scope.chartConfig.xAxis.categories.push(unixTime);
       $scope.chartConfig.xAxis.categories.push(game.datePlayed);
       } else {

       }*/

      //console.log('$scope.chartConfig.xAxis.categories', $scope.chartConfig.xAxis.categories);

      //console.log('======================');
      //currentData.push(game.goalsScored);

      //var evenTick = true;

      /*push({
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
       });*/

    });

    $scope.chartConfig.xAxis.categories.sort();
    console.log('$scope.chartConfig.xAxis.categories', $scope.chartConfig.xAxis.categories);

  };

  var duplicateDateInList = function (date, list) {

    var duplicate = false;

    list.some(function (element) {
      if (date === element) {
        duplicate = true;
        return true;
      }
    });

    console.log('returning', duplicate, 'for', date, 'in', list);

    return duplicate;

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