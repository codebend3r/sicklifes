/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.factory('$textManipulator', function () {

  var textManipulator = {

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

    formattedFullName: function (firstName, lastName) {
      return textManipulator.stripVowelAccent((firstName !== null ? firstName : '') + ' ' + lastName.toUpperCase());
    },

    formattedLeagueName: function (leagueName) {
      if (leagueName === 'uefa') {
        return 'EUROPA';
      } else if (leagueName === 'seri') {
        return 'SERIE A';
      } else {
        return leagueName.toUpperCase();
      }
    },

    getLeagueByURL: function(url) {
      if (url.contains('liga')) {
        return 'liga';
      } else if (url.contains('epl')) {
        return 'epl';
      } else if (url.contains('seri')) {
        return 'seri';
      } else if (url.contains('chlg')) {
        return 'chlg';
      } else if (url.contains('uefa')) {
        return 'uefa';
      } else {
        return 'unknown';
      }
    },

    acceptedLeague: function (league) {
      return league === 'liga' || league === 'epl' || league === 'seri' || league === 'chlg' || league === 'uefa';
    },

    getPlayerPlayerRecordURL: function (league, id) {
      return 'http://origin-api.thescore.com/' + league.toLowerCase() + '/players/' + id + '/player_records';
    },

    getPlayerSummaryURL: function (league, id) {
      return 'http://origin-api.thescore.com/' + league.toLowerCase() + '/players/' + id + '/summary';
    },

    getPlayerProfileURL: function (league, id) {
      return 'http://origin-api.thescore.com/' + league + '/players/' + id;
    }

    /*getTeamInfoURL: function (league, id) {
      return 'http://origin-api.thescore.com/liga/teams/' + id;
    }*/


  };

  return textManipulator;

});
