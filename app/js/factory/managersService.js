/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('managersService', function ($rootScope) {

      /**
       * TODO
       */
      var allManagers = {

        chester: {
          managerName: 'Chester',
          teamName: 'Reality Kings'
        },
        frank: {
          managerName: 'Frank',
          teamName: 'Schiraldihno'
        },
        dan: {
          managerName: 'Dan',
          teamName: 'Dan'
        },
        justin: {
          managerName: 'Justin',
          teamName: 'Justin'
        },
        mike: {
          managerName: 'Mike',
          teamName: 'Mike'
        },
        joe: {
          managerName: 'Joe',
          teamName: 'Joe'
        },

        /**
         * @name findPlayerInManagers
         * @description looks through all the managers and returns the matching manager if player belong to a manager
         * @param id
         * @returns {manager}
         */
        findPlayerInManagers: function (id) {

          var matchingManager = null;
          var matchingPlayer = null;

          //var combinedManagers = _.defaults({}, $rootScope.managerData.data, $rootScope.managerPlayers.data);

          _.some($rootScope.managerPlayers.data, function (m, key) {
            //var currentManager = _.defaults({}, $rootScope.managerData.data, $rootScope.managerPlayers.data)[key];
            //console.log('currentManager', currentManager);
            return !angular.isUndefinedOrNull(m.players[id]) && (matchingManager = m) && (matchingPlayer = m.players[id]);
          });

          return {
            manager: matchingManager,
            player: matchingPlayer
          };

        }

      };

      return allManagers;

    });

})();
