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

        /*
        player object example:
         {
           playerName: 'Lionel MESSI',
           teamName: 'BARCELONA',
           league: 'LIGA',
           id: 1126,
           status: 'active'
         }
         */

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

          _.some($rootScope.managerPlayers.data, function (manager) {

            return !angular.isUndefinedOrNull(manager.players[id]) && (matchingManager = manager) && (matchingPlayer = manager.players[id]);

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
