/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.factory('$textManipulator', function () {

  return {

    stripVowelAccent: function (str) {
      var rExps = [
        {re: /[\xC0-\xC6]/g, ch: 'A'},
        {re: /[\xE0-\xE6]/g, ch: 'a'},
        {re: /[\xC8-\xCB]/g, ch: 'E'},
        {re: /[\xE8-\xEB]/g, ch: 'e'},
        {re: /[\xCC-\xCF]/g, ch: 'I'},
        {re: /[\xEC-\xEF]/g, ch: 'i'},
        {re: /[\xD2-\xD6]/g, ch: 'O'},
        {re: /[\xF2-\xF6]/g, ch: 'o'},
        {re: /[\xD9-\xDC]/g, ch: 'U'},
        {re: /[\xF9-\xFC]/g, ch: 'u'},
        {re: /[\xD1]/g, ch: 'N'},
        {re: /[\xF1]/g, ch: 'n'}
      ];

      for (var i = 0, len = rExps.length; i < len; i++)
        str = str.replace(rExps[i].re, rExps[i].ch);

      return str;

    },

    isDomesticGoal: function (league) {
      return league === 'liga' || league === 'epl' || league === 'seri';
    },

    isLeagueGoal: function (league) {
      return league === 'chlg' || league === 'uefa';
    },

    isChampionsLeagueGoal: function (league) {
      return league === 'chlg';
    },

    isEuropaGoal: function (league) {
      return league === 'uefa';
    },

    acceptedLeague: function (league) {
      return league === 'liga' || league === 'epl' || league === 'seri' || league === 'chlg' || league === 'uefa';
    },

    getPlayerURL: function (league, id) {
      return 'http://origin-api.thescore.com/' + league.toLowerCase() + '/players/' + id + '/player_records';
    },

    getPlayerSummaryURL: function (league, id) {
      return'http://origin-api.thescore.com/' + league.toLowerCase() + '/players/' + id + '/summary';
    },

    getPlayerProfileURL: function (id) {
      return 'http://origin-api.thescore.com/soccer/players/' + id;
    }



  }

});