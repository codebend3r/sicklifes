/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$managersService', function ($fireBaseService) {

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
          teamName: '-'
        },
        justin: {
          managerName: 'Justin',
          teamName: '-'
        },
        mike: {
          managerName: 'Mike',
          teamName: '-'
        },
        joe: {
          managerName: 'Joe',
          teamName: '-'
        },

        /**
         * TODO
         */
        getAllPlayers: function () {

          //$fireBaseService.initialize(allManagers);
          var firePromise = $fireBaseService.getFireBaseData();
          firePromise.promise.then(function (data) {

            return data;

          }, function () {

            return [
              allManagers.chester,
              allManagers.frank,
              allManagers.dan,
              allManagers.justin,
              allManagers.mike,
              allManagers.joe
            ];

          });

          return firePromise;

        }

      };

      return allManagers;

    });

})();