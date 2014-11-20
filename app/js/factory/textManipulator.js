/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.factory('$textManipulator', function () {

  var textManipulator = {

    stripVowelAccent: function
      (str) {
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
      league = league.toLocaleLowerCase();
      return league === 'liga' || league === 'epl' || league === 'seri';
    },

    isLeagueGoal: function (league) {
      league = league.toLocaleLowerCase();
      return league === 'chlg' || league === 'uefa';
    },

    isChampionsLeagueGoal: function (league) {
      league = league.toLocaleLowerCase();
      return league === 'chlg';
    },

    isEuropaGoal: function (league) {
      league = league.toLocaleLowerCase();
      return league === 'uefa' || league === 'europa';
    },

    formattedFullName: function (firstName, lastName) {
      return textManipulator.stripVowelAccent((firstName !== null && firstName !== undefined ? firstName : '') + ' ' + lastName.toUpperCase());
    },

    formattedLeagueName: function (league) {
      league = league.toLocaleLowerCase();
      if (league === 'uefa' || league === 'europa') {
        return 'europa';
      } else if (league === 'seri') {
        return 'seri';
      } else if (league === 'liga') {
        return 'liga';
      } else if (league === 'epl') {
        return 'epl';
      } else if (league === 'chlg') {
        return 'chlg';
      } else {
        return league.toUpperCase();
      }
    },

    /**
     * returns object will full league names
     */
    leagueLongNames: {
      liga: 'LA LIGA',
      epl: 'ENGLISH PREMIER LEAGUE',
      seri: 'SERIE A',
      chlg: 'CHAMPIONS LEAGUE',
      euro: 'EUROPA LEAGUE'
    },

    /**
     * returns image ref
     * @type {{liga: string, epl: string, seri: string, chlg: string, euro: string}}
     */
    leagueImages: {

      liga: './images/leagues/liga.png',
      epl: './images/leagues/epl.png',
      seri: './images/leagues/seriea.png',
      chlg: './images/leagues/chlg.png',
      euro: './images/leagues/europa.png'

    },

    /**
     *
     * @param result
     * @returns {{}}
     */
    getPlayerValidLeagues: function (result) {
      var leagueObject = {};
      result.data.teams.forEach(function (team, i) {
        team.leagues.forEach(function (league, j) {
          if (textManipulator.acceptedLeague(league.slug)) {
            if (league.slug === 'liga') leagueObject.inLiga = true;
            if (league.slug === 'epl') leagueObject.inEPL = true;
            if (league.slug === 'seri') leagueObject.inSeri = true;
            if (league.slug === 'chlg') leagueObject.inChlg = true;
            if (league.slug === 'uefa') leagueObject.inEuro = true;
          }
        });
      });
      return leagueObject;
    },

    result: function (game) {
      var result = '';
      if (game.alignment === 'away') {
        if (game.box_score.score.away.score > game.box_score.score.home.score) {
          result = 'W';
        } else if (game.box_score.score.away.score < game.box_score.score.home.score) {
          result = 'L';
        } else {
          result = 'T';
        }
      } else {
        if (game.box_score.score.away.score < game.box_score.score.home.score) {
          result = 'W';
        } else if (game.box_score.score.away.score > game.box_score.score.home.score) {
          result = 'L';
        } else {
          result = 'T';
        }
      }
      return result;
    },

    finalScore: function (game) {
      var final = '';
      if (game.alignment === 'away') {
        final += game.box_score.score.away.score;
        final += '-' + game.box_score.score.home.score;
      } else {
        final += game.box_score.score.home.score;
        final += '-' + game.box_score.score.away.score;
      }
      return final;
    },

    properLeagueName: function (league) {
      league = league.toLocaleLowerCase();
      if (league === 'uefa' || league === 'europa') {
        return 'EUROPA LEAGUE';
      } else if (league === 'seri') {
        return 'SERIE A';
      } else if (league === 'liga') {
        return 'LA LIGA';
      } else if (league === 'epl') {
        return 'ENGLISH PREMIER LEAGUE';
      } else if (league === 'chlg') {
        return 'CHAMPIONS LEAGUE';
      } else {
        return leagueName.toUpperCase();
      }
    },

    getLeagueByURL: function (url) {
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
      league = league.toLocaleLowerCase();
      //console.log('league', league)
      //return league === 'liga' || league === 'epl' || league === 'seri' || league === 'chlg' || league === 'europa';
      return true;
    },

    getPlayerPlayerRecordURL: function (league, id) {
      return 'http://origin-api.thescore.com/' + league.toLowerCase() + '/players/' + id + '/player_records';
    },

    getPlayerSummaryURL: function (league, id) {
      return 'http://origin-api.thescore.com/' + league.toLowerCase() + '/players/' + id + '/summary';
    },

    getPlayerProfileURL: function (league, id) {
      return 'http://origin-api.thescore.com/' + league.toLowerCase() + '/players/' + id;
    },

    getTeamInfoURL: function (id) {
      return 'http://origin-api.thescore.com/soccer/teams/' + id;
    }


  };

  return textManipulator;

})
;
