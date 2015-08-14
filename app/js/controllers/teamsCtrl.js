(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('teamsCtrl', function ($scope, $http) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /**
       * TODO
       */
      $scope.loading = true;

      /**
       * init
       */
      var init = function () {

        $http({
          url: 'http://api.thescore.com/epl/teams/61/players',
          method: 'GET'
        }).then(function(result) {

          $scope.loading = false;
          console.log('result.data:', result.data);
          $scope.players = _.map(result.data, function(teamData) {
            return {
              id: teamData.id,
              position: teamData.position,
              fullName: teamData.full_name
            };
          });

        });

      };

      init();

    });

})();
