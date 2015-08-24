(function () {

  angular.module('sicklifes')

    .controller('playersDetailsCtrl', function ($scope, $timeout, $apiFactory, $location, $stateParams, $arrayMappers, $textManipulator, $objectUtils, $managersService, $momentService, $fireBaseService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      var dataKeyName = 'playerPoolData';

      /*
       * TODO
       */
      $scope.loading = true;

      /*
       * TODO
       */
      $scope.admin = $stateParams.admin;

      /*
       * TODO
       */
      $scope.tableHeader = [
        {
          columnClass: 'col-md-4 col-sm-4 col-xs-6',
          text: 'Opponent'
        },
        {
          columnClass: 'col-md-2 col-sm-1 col-xs-2 text-center',
          text: 'G'
        },
        {
          columnClass: 'col-md-2 hidden-sm hidden-xs text-center',
          text: 'Final Score'
        },
        {
          columnClass: 'col-md-2 col-sm-3 hidden-xs',
          text: 'League'
        },
        {
          columnClass: 'col-md-2 col-sm-3 col-xs-4',
          text: 'Date Played'
        }
      ];

      /*
       * player
       */
      $scope.player = {};

      /**
       * league images
       */
      $scope.leagueImages = $textManipulator.leagueImages;

      $scope.getAllGameLogs = function () {

        console.log('get all game logs');

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      var checkYesterday = function (syncDate) {

        if ($momentService.isPastYesterday(syncDate)) {
          console.log('IS YESTERDAY');
          //getHttpData();
          return true;
        } else {
          console.log('NOT YESTERDAY YET');
          $scope.loading = false;
          return false;
        }

      };

      /**
       * saves current data to firebase
       */
      var saveToFireBase = function () {

        console.log('////////////////////////////////////');
        console.log('managersData', managersData);
        console.log('////////////////////////////////////');

        var saveObject = {
          _syncedFrom: 'playerDetailsCtrl',
          _lastSyncedOn: $dateService.syncDate(),
          chester: managersData.chester,
          frank: managersData.frank,
          dan: managersData.dan,
          justin: managersData.justin,
          mike: managersData.mike,
          joe: managersData.joe
        };

        $fireBaseService.saveToFireBase(saveObject, playerPoolData);

      };

      /**
       *
       * @type {{}}
       */
      var managersData = {};

      /**
       * call when firebase data has loaded
       * defines $scope.managersData
       * @param firebaseData
       */
      var fireBaseLoaded = function (firebaseData) {

        console.log('fireBaseLoaded -- playersDetailsCtrl');

        var playerPoolData = firebaseData[dataKeyName];
        $scope.allPlayers = playerPoolData.allPlayers;

        // console.log('$scope.allPlayers:', $scope.allPlayers);
        console.log('$scope.allPlayers.length:', $scope.allPlayers.length);

        managersData = {
          chester: firebaseData.managersData.chester,
          frank: firebaseData.managersData.frank,
          dan: firebaseData.managersData.dan,
          justin: firebaseData.managersData.justin,
          mike: firebaseData.managersData.mike,
          joe: firebaseData.managersData.joe
        };

        //////////////////

        console.log('syncDate:', playerPoolData._lastSyncedOn);

        // checkYesterday(syncDate);

        findPlayerByID();

      };

      var onRequestFinished = function (data) {

        console.log('DATA:', data);
        //console.log('CURRENT PLAYER:', $scope.player);
        //console.log(data);

      };

      /**
       * find more data on a player by id in the route
       */
      var findPlayerByID = function () {

        $scope.allPlayers.some(function (player) {
          if (player.id === id) {
            $scope.player = player;
            return true;
          }
        });

        var manager = managersData[$scope.player.managerName] || null;

        // results goal totals to zero
        $scope.player = $objectUtils.playerResetGoalPoints($scope.player);

        $apiFactory.getPlayerProfile('soccer', $scope.player.id)
          .then($arrayMappers.playerInfo.bind(this, $scope.player))
          .then($arrayMappers.playerGamesLog.bind(this, { player: $scope.player, manager: manager }))
          .then(function () {
            console.log('player data is loaded');
            $scope.loading = false;
            //saveToFireBase();
          });

      };

      /**
       * id used to identify a player from thescore.ca api
       */
      var id = Number($stateParams.playerID);

      /**
       * init function
       */
      var init = function () {

        id = Number($stateParams.playerID);
        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(fireBaseLoaded);

      };

      init();

    });

})();
