(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('leaguesCtrl', function ($scope, $timeout, $apiFactory, $date, $localStorage, $managersService, $location, $routeParams, $updateDataUtils, $arrayMappers, $dateService, $rootScope, $textManipulator, $fireBaseService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $scope.loading = true;

      $scope.admin = $routeParams.admin;

      $scope.tableHeader = [{
        columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center small-hpadding',
        text: 'Rank'
      }, {
        columnClass: 'col-md-3 col-sm-4 col-xs-6 small-hpadding',
        text: 'Team'
      }, {
        columnClass: 'col-md-2 col-sm-2 hidden-xs text-center small-hpadding',
        text: 'W'
      }, {
        columnClass: 'col-md-2 col-sm-2 hidden-xs text-center small-hpadding',
        text: 'L'
      }, {
        columnClass: 'col-md-2 col-sm-2 hidden-xs text-center small-hpadding',
        text: 'T'
      }, {
        columnClass: 'col-md-2 col-sm-4 col-xs-4 text-center small-hpadding',
        text: 'Points'
      }];

      /*
       <div class='col-md-1 col-sm-1 col-xs-2 small-hpadding'>{{team.rank}}</div>
       <div class='col-md-2 col-sm-4 hidden-xs small-hpadding bold small-text'>{{team.teamName}}</div>
       <div class='col-md-2 col-sm-2 col-xs-2 text-center small-hpadding'>{{team.wins}}</div>
       <div class='col-md-2 col-sm-2 col-xs-2 text-center small-hpadding'>{{team.loss}}</div>
       <div class='col-md-2 col-sm-2 col-xs-2 text-center small-hpadding'>{{team.ties}}</div>
       <div class='col-md-2 col-sm-2 col-xs-2 text-center small-hpadding bold'>{{team.points}}</div>
       */

      $scope.allRequest = [];

      $scope.changeLeague = function (league) {
        //
      };

      $scope.saveToFireBase = function () {

        console.log('////////////////////////////////////');
        console.log('$scope.allLeagues:', $scope.allLeagues);
        console.log('$scope.allLeagues[0].source:', $scope.allLeagues[0].source);
        console.log('$scope.allLeagues[0].source[0]:', $scope.allLeagues[0].source[0]);
        console.log('////////////////////////////////////');

        var saveObject = {
          _syncedFrom: 'leaguesCtrl',
          _lastSyncedOn: $dateService.syncDate(),
          LIGA: $scope.allLeagues[0].source,
          EPL: $scope.allLeagues[1].source,
          SERI: $scope.allLeagues[2].source,
          CHLG: $scope.allLeagues[3].source,
          UEFA: $scope.allLeagues[4].source
        };

        $fireBaseService.saveToFireBase(saveObject, 'leagueTables');

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      var allLeaguesObj = {};

      var onLeaguesUpdated = function (leagueLeadersData) {

        $scope.leagueLeadersData = leagueLeadersData;
        $scope.selectedLeague = $scope.leagueLeadersData[0];

      };

      var fireBaseLoaded = function (data) {

        console.log('///////////////////');
        console.log('FB --> data.leagueTables:', data.leagueTables);
        console.log('///////////////////');

        $scope.allLeagues = [
          {
            name: $textManipulator.leagueLongNames.liga,
            source: data.leagueTables.LIGA,
            className: 'liga',
            img: $textManipulator.leagueImages.liga
          },
          {
            name: $textManipulator.leagueLongNames.epl,
            source: data.leagueTables.EPL,
            className: 'epl',
            img: $textManipulator.leagueImages.epl
          },
          {
            name: $textManipulator.leagueLongNames.seri,
            source: data.leagueTables.SERI,
            className: 'seri',
            img: $textManipulator.leagueImages.seri
          },
          {
            name: $textManipulator.leagueLongNames.chlg,
            source: data.leagueTables.CHLG,
            className: 'chlg',
            img: $textManipulator.leagueImages.chlg
          },
          {
            name: $textManipulator.leagueLongNames.euro,
            source: data.leagueTables.UEFA,
            className: 'europa',
            img: $textManipulator.leagueImages.euro
          }
        ];

        //var managersData = [
        //  data.managersData.chester,
        //  data.managersData.frank,
        //  data.managersData.dan,
        //  data.managersData.justin,
        //  data.managersData.mike,
        //  data.managersData.joe
        //];

        $scope.selectedLeague = $scope.allLeagues[0];

        var syncDate = $date.create(data.leagueTables._lastSynedOn);

        console.log('syncDate leagueData:', data.leagueTables._lastSyncedOn);

        if (syncDate.isYesterday()) {
          console.log('is past yesterday');
          //$scope.updateData();
          updateLeaguesData();
        } else {
          $scope.loading = false;
        }

      };

      var loadFromLocal = function(data) {

        console.log('LOCAL -- > data', data);

        $scope.allLeagues = [
          {
            name: $textManipulator.leagueLongNames.liga,
            source: data.LIGA,
            className: 'liga',
            img: $textManipulator.leagueImages.liga
          },
          {
            name: $textManipulator.leagueLongNames.epl,
            source: data.EPL,
            className: 'epl',
            img: $textManipulator.leagueImages.epl
          },
          {
            name: $textManipulator.leagueLongNames.seri,
            source: data.SERI,
            className: 'seri',
            img: $textManipulator.leagueImages.seri
          },
          {
            name: $textManipulator.leagueLongNames.chlg,
            source: data.CHLG,
            className: 'chlg',
            img: $textManipulator.leagueImages.chlg
          },
          {
            name: $textManipulator.leagueLongNames.euro,
            source: data.UEFA,
            className: 'europa',
            img: $textManipulator.leagueImages.euro
          }
        ];

        $scope.selectedLeague = $scope.allLeagues[0];

        $scope.loading = false;

      };

      var httpDataLoaded = function (result) {

        console.log('HTTP -- > result', result);

        $scope.allLeagues = [
          {
            name: $textManipulator.leagueLongNames.liga,
            source: result[0].data,
            className: 'liga',
            img: $textManipulator.leagueImages.liga
          },
          {
            name: $textManipulator.leagueLongNames.epl,
            source: result[1].data,
            className: 'epl',
            img: $textManipulator.leagueImages.epl
          },
          {
            name: $textManipulator.leagueLongNames.seri,
            source: result[2].data,
            className: 'seri',
            img: $textManipulator.leagueImages.seri
          },
          {
            name: $textManipulator.leagueLongNames.chlg,
            source: result[3].data,
            className: 'chlg',
            img: $textManipulator.leagueImages.chlg
          },
          {
            name: $textManipulator.leagueLongNames.euro,
            source: result[4].data,
            className: 'europa',
            img: $textManipulator.leagueImages.euro
          }
        ];

        $scope.selectedLeague = $scope.allLeagues[0];

        $scope.loading = false;

      };

      var updateLeaguesData = function () {

        $updateDataUtils.updateLeagueTables()
          .then(httpDataLoaded);

      };

      var init = function () {

        console.log('leaguesCtrl - init');

        if (angular.isDefined($rootScope.leagueTables)) {
          
          loadFromLocal($rootScope.leagueTables);

        } else if (angular.isDefined($localStorage.leagueTables)) {

          loadFromLocal($localStorage.leagueTables);

        } else {

          $fireBaseService.initialize($scope);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.then(fireBaseLoaded);
        }

      };

      $timeout(init, 0);

    });

})();
