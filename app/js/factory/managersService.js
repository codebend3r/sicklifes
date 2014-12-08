/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.factory('$managersService', function ($fireBaseService) {

  /**
   * TODO
   */
  var allManagers = {

    chester: {
      managerName: 'Chester',
      teamName: 'Reality Kings',
      players: [
        {
          playerName: 'Cristiano RONALDO',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 1310,
          status: 'active'
        },
        {
          playerName: 'Radamel FALCAO',
          teamName: 'MANCHESTER UNITED',
          league: 'EPL',
          id: 2328,
          status: 'active'
        },
        {
          playerName: 'Gareth BALE',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 1890,
          status: 'active'
        },
        {
          playerName: 'Alessio CERCI',
          teamName: 'ATLETICO MADRID',
          league: 'LIGA',
          id: 316,
          status: 'active'
        },
        {
          playerName: 'Yaya TOURE',
          teamName: 'MANCHESTER CITY',
          league: 'EPL',
          id: 1137,
          status: 'active'
        },
        {
          playerName: 'Wilfried BONY',
          teamName: 'SWANSEA CITY',
          league: 'EPL',
          id: 8603,
          status: 'active'
        },
        {
          playerName: 'Carlos VELA',
          teamName: 'REAL SOCIEDAD',
          league: 'LIGA',
          id: 1633,
          status: 'active'
        },
        {
          playerName: 'Juan CUADRADO',
          teamName: 'FIORENTINA',
          league: 'SERI',
          id: 358,
          status: 'active'
        },
        {
          playerName: 'Domenico BERARDI',
          teamName: 'SASSUOLO',
          league: 'SERI',
          id: 22137,
          status: 'active'
        },
        {
          playerName: 'Arjen ROBBEN',
          teamName: 'BAYERN MUNICH',
          league: 'CHLG',
          id: 2238,
          status: 'active'
        },
        {
          playerName: 'Loic REMY',
          teamName: 'CHELSEA',
          league: 'EPL',
          id: 4780,
          status: 'active'
        },
        {
          playerName: 'Marek HAMSIK',
          teamName: 'NAPOLI',
          league: 'SERI',
          id: 267,
          status: 'active'
        },
        {
          playerName: 'HULK',
          teamName: 'ZENIT ST. PETERSBURG',
          league: 'CHLG',
          id: 2334,
          status: 'active'
        },
        {
          playerName: 'Paul POGBA',
          teamName: 'JUVENTUS',
          league: 'SERI',
          id: 13802,
          status: 'active'
        },
        {
          playerName: 'Chicharito HERNANDEZ',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 4225,
          status: 'active'
        },
        {
          playerName: 'Keisuke HONDA',
          teamName: 'AC MILAN',
          league: 'SERI',
          id: 3913,
          status: 'active'
        },
        {
          playerName: 'Andres INIESTA',
          teamName: 'BARCELONA',
          league: 'LIGA',
          id: 1120,
          status: 'active'
        },
        {
          playerName: 'Adam LALLANA',
          teamName: 'LIVERPOOL',
          league: 'EPL',
          id: 7070,
          status: 'active'
        },
        {
          playerName: 'Freddy GUARIN',
          teamName: 'INTER MILAN',
          league: 'SERI',
          id: 2331,
          status: 'active'
        },
        {
          playerName: 'Roberto SOLDADO',
          teamName: 'TOTTENHAM',
          league: 'EPL',
          id: 1536,
          status: 'active'
        },
        {
          playerName: 'Henrik MKHITARYAN',
          teamName: 'BORRUSIA DORTMUND',
          league: 'CHLG',
          id: 10070,
          status: 'active'
        },
        {
          playerName: 'Ibai GOMEZ',
          teamName: 'ATHLETIC BILBAO',
          league: 'LIGA',
          id: 11373,
          status: 'active'
        },
        {
          playerName: 'Dries MERTENS',
          teamName: 'NAPOLI',
          league: 'SERI',
          id: 10463,
          status: 'active'
        },
        {
          playerName: 'Mesut OZIL',
          teamName: 'ARSENAL',
          league: 'EPL',
          id: 3267,
          status: 'active'
        }
      ]
    },

    frank: {
      managerName: 'Frank',
      teamName: 'Schiraldihno',
      players: [
        {
          playerName: 'Lionel MESSI',
          teamName: 'BARCELONA',
          league: 'LIGA',
          id: 1126,
          status: 'active'
        },
        {
          playerName: 'Daniel STURRIDGE',
          teamName: 'LIVERPOOL',
          league: 'EPL',
          id: 1743,
          status: 'active'
        },
        {
          playerName: 'Edin DZEKO',
          teamName: 'MANCHESTER CITY',
          league: 'EPL',
          id: 2857,
          status: 'active'
        },
        {
          playerName: 'Stevan JOVETIC',
          teamName: 'MANCHESTER CITY',
          league: 'EPL',
          id: 123,
          status: 'active'
        },
        {
          playerName: 'Eden HAZARD',
          teamName: 'CHELSEA',
          league: 'EPL',
          id: 8653,
          status: 'active'
        },
        {
          playerName: 'Aaron RAMSEY',
          teamName: 'ARSENAL',
          league: 'EPL',
          id: 1623,
          status: 'active'
        },
        {
          playerName: 'Fernando TORRES',
          teamName: 'AC MILAN',
          league: 'SERI',
          id: 1789,
          status: 'active'
        },
        {
          playerName: 'Pablo OSVALDO',
          teamName: 'INTER MILAN',
          league: 'SERI',
          id: 101,
          status: 'active'
        },
        {
          playerName: 'Andre SCHURRLE',
          teamName: 'CHELSEA',
          league: 'EPL',
          id: 3120,
          status: 'active'
        },
        {
          playerName: 'Cesc FABREGAS',
          teamName: 'CHELSEA',
          league: 'EPL',
          id: 1613,
          status: 'active'
        },
        {
          playerName: 'NOLITO',
          teamName: 'CELTA VIGO',
          league: 'LIGA',
          id: 12802,
          status: 'active'
        },
        {
          playerName: 'Christian BENTEKE',
          teamName: 'ASTON VILLA',
          league: 'EPL',
          id: 15086,
          status: 'active'
        },
        {
          playerName: 'Raul JIMENEZ',
          teamName: 'ATLETICO MADRID',
          league: 'LIGA',
          id: 16216,
          status: 'active'
        },
        {
          playerName: 'Iker MUNIAIN',
          teamName: 'ATHLETIC BILBAO',
          league: 'LIGA',
          id: 1103,
          status: 'active'
        },
        {
          playerName: 'Marco SAU',
          teamName: 'CAGLIARI',
          league: 'SERI',
          id: 10800,
          status: 'active'
        },
        {
          playerName: 'CHARLES',
          teamName: 'CELTA VIGO',
          league: 'LIGA',
          id: 22502,
          status: 'active'
        },
        {
          playerName: 'MICHU',
          teamName: 'NAPOLI',
          league: 'SERI',
          id: 15276,
          status: 'active'
        },
        {
          playerName: 'Alberto PALOSCHI',
          teamName: 'CHIEVO',
          league: 'SERI',
          id: 299,
          status: 'active'
        },
        {
          playerName: 'Nathan DYER',
          teamName: 'SWANSEA CITY',
          league: 'EPL',
          id: 5183,
          status: 'active'
        },
        {
          playerName: 'Antonio CASSANO',
          teamName: 'PARMA',
          league: 'SERI',
          id: 428,
          status: 'active'
        },
        {
          playerName: 'Toni KROOS',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 2229,
          status: 'active'
        },
        {
          playerName: 'Ciro IMMOBILE',
          teamName: 'BORUSSIA DORTMUND',
          league: 'CHLG',
          id: 3747,
          status: 'active'
        },
        {
          playerName: 'Angel DI MARIA',
          teamName: 'MANCHESTER UNITED',
          league: 'EPL',
          id: 4277,
          status: 'active'
        },
        {
          playerName: 'Jonathan DE GUZMAN',
          teamName: 'NAPOLI',
          league: 'SERI',
          id: 10435,
          status: 'active'
        }

      ]

    },

    dan: {
      managerName: 'Dan',
      teamName: '-',
      players: [
        {
          playerName: 'Diego COSTA',
          teamName: 'CHELSEA',
          league: 'EPL',
          id: 1365,
          status: 'active'
        },
        {
          playerName: 'Zlatan IBRAHIMOVIC',
          teamName: 'PSG',
          league: 'CHLG',
          id: 1119,
          status: 'active'
        },
        {
          playerName: 'Mario BALOTELLI',
          teamName: 'LIVERPOOL',
          league: 'EPL',
          id: 137,
          status: 'active'
        },
        {
          playerName: 'James RODRIGUEZ',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 12229,
          status: 'active'
        },
        {
          playerName: 'Mattia DESTRO',
          teamName: 'ROMA',
          league: 'SERI',
          id: 3729,
          status: 'active'
        },
        {
          playerName: 'Wayne ROONEY',
          teamName: 'MANCHESTER UNITED',
          league: 'EPL',
          id: 1851,
          status: 'active'
        },
        {
          playerName: 'PEDRO',
          teamName: 'BARCELONA',
          league: 'LIGA',
          id: 1132,
          status: 'active'
        },
        {
          playerName: 'Arturo VIDAL',
          teamName: 'JUVENTUS',
          league: 'SERI',
          id: 3436,
          status: 'active'
        },
        {
          playerName: 'Simone ZAZA',
          teamName: 'SASSUOLO',
          league: 'SERI',
          id: 11367,
          status: 'active'
        },
        {
          playerName: 'AMAURI',
          teamName: 'TORINO',
          league: 'SERI',
          id: 163,
          status: 'active'
        },
        {
          playerName: 'ISCO',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 7987,
          status: 'active'
        },
        {
          playerName: 'GERVINHO',
          teamName: 'ROMA',
          league: 'SERI',
          id: 4910,
          status: 'active'
        },
        {
          playerName: 'Pablo PIATTI',
          teamName: 'VALENCIA',
          league: 'LIGA',
          id: 1025,
          status: 'active'
        },
        {
          playerName: 'Steven GERRARD',
          teamName: 'LIVERPOOL',
          league: 'EPL',
          id: 1767,
          status: 'active'
        },
        {
          playerName: 'OSCAR',
          teamName: 'CHELSEA',
          league: 'EPL',
          id: 16228,
          status: 'active'
        },
        {
          playerName: 'Aleix VIDAL',
          teamName: 'SEVILLA',
          league: 'LIGA',
          id: 22498,
          status: 'active'
        },
        {
          playerName: 'Mauricio PINILLA',
          teamName: 'GENOA',
          league: 'SERI',
          id: 10712,
          status: 'active'
        },
        {
          playerName: 'Jonathan BIABIANY',
          teamName: 'PARMA',
          league: 'SERI',
          id: 281,
          status: 'active'
        },
        {
          playerName: 'Alvaro MORATA',
          teamName: 'JUVENTUS',
          league: 'SERI',
          id: 13168,
          status: 'active'
        },
        {
          playerName: 'Abel HERNANDEZ',
          teamName: 'Hull City',
          league: 'EPL',
          id: 494,
          status: 'active'
        },
        {
          playerName: 'Richmond BOAKYE',
          teamName: 'ATALANTA',
          league: 'SERI',
          id: 7625,
          status: 'active'
        },
        {
          playerName: 'Kingsley COMAN',
          teamName: 'JUVENTUS',
          league: 'SERI',
          id: 23718,
          status: 'active'
        },
        {
          playerName: 'Fabio BORINI',
          teamName: 'LIVERPOOL',
          league: 'EPL',
          id: 1722,
          status: 'active'
        },
        {
          playerName: 'Lukas PODOLSKI',
          teamName: 'ARSENAL',
          league: 'EPL',
          id: 3405,
          status: 'active'
        }

      ]
    },

    justin: {
      managerName: 'Justin',
      teamName: '-',
      players: [
        {
          playerName: 'Alexis SANCHEZ',
          teamName: 'ARSENAL',
          league: 'EPL',
          id: 4364,
          status: 'active'
        },
        {
          playerName: 'Carlos TEVEZ',
          teamName: 'JUVENTUS',
          league: 'SERI',
          id: 1815,
          status: 'active'
        },
        {
          playerName: 'Aritz ADURIZ',
          teamName: 'ATHLETIC BILBAO',
          league: 'LIGA',
          id: 1227,
          status: 'active'
        },
        {
          playerName: 'Romelu LUKAKU',
          teamName: 'EVERTON',
          league: 'EPL',
          id: 2204,
          status: 'active'
        },
        {
          playerName: 'Carlos BACCA',
          teamName: 'SEVILLA',
          league: 'LIGA',
          id: 16834
        },
        {
          playerName: 'Mario GOMEZ',
          teamName: 'FIORENTINA',
          league: 'SERI',
          id: 2225,
          status: 'active'
        },
        {
          playerName: 'Antonio DI NATALE',
          teamName: 'UDINESE',
          league: 'SERI',
          id: 349,
          status: 'active'
        },
        {
          playerName: 'Mauro ICARDI',
          teamName: 'INTER',
          league: 'SERI',
          id: 17567,
          status: 'active'
        },
        {
          playerName: 'Steven NAISMITH',
          teamName: 'EVERTON',
          league: 'EPL',
          id: 2474,
          status: 'active'
        },
        {
          playerName: 'Sergio GARCIA',
          teamName: 'ESPANYOL',
          league: 'LIGA',
          id: 11794,
          status: 'active'
        },
        {
          playerName: 'Ishak BELFODIL',
          teamName: 'PARMA',
          league: 'SERI',
          id: 3002,
          status: 'active'
        },
        {
          playerName: 'Edinson CAVANI',
          teamName: 'PSG',
          league: 'CHLG',
          id: 490,
          status: 'active'
        },
        {
          playerName: 'Ikechukwu UCHE',
          teamName: 'VILLARREAL',
          league: 'LIGA',
          id: 1433
        },
        {
          playerName: 'Paco ALCACER',
          teamName: 'VALENCIA',
          league: 'LIGA',
          id: 12141,
          status: 'active'
        },
        {
          playerName: 'Nikica JELAVIC',
          teamName: 'HULL CITY',
          league: 'EPL',
          id: 8290,
          status: 'active'
        },
        {
          playerName: 'Keita BALDE',
          teamName: 'LAZIO',
          league: 'SERI',
          id: 21854,
          status: 'active'
        },
        {
          playerName: 'Mame DIOUF',
          teamName: 'STOKE CITY',
          league: 'EPL',
          id: 3921,
          status: 'active'
        },
        {
          playerName: 'Alvaro VAZQUEZ',
          teamName: 'GETAFE',
          league: 'LIGA',
          id: 12661,
          status: 'active'
        },
        {
          playerName: 'Charlie AUSTIN',
          teamName: 'QPR',
          league: 'EPL',
          id: 7485,
          status: 'active'
        },
        {
          playerName: 'Luis MURIEL',
          teamName: 'UDINESE',
          league: 'SERI',
          id: 14082,
          status: 'active'
        },
        {
          playerName: 'Marcelo LARRONDO',
          teamName: 'TORINO',
          league: 'SERI',
          id: 470,
          status: 'active'
        },
        {
          playerName: 'Peter CROUCH',
          teamName: 'STOKE CITY',
          league: 'EPL',
          id: 1895,
          status: 'active'
        },
        {
          playerName: 'Adrian RAMOS',
          teamName: 'BORUSSIA DORTMUND',
          league: 'CHLG',
          id: 3209,
          status: 'active'
        },
        {
          playerName: 'Paulo DYBALA',
          teamName: 'PALERMO',
          league: 'SERI',
          id: 18403,
          status: 'active'
        }

      ]
    },

    mike: {
      managerName: 'Mike',
      teamName: '-',
      players: [
        {
          playerName: 'Karim BENZEMA',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 1308,
          status: 'active'
        },
        {
          playerName: 'Fernando LLORENTE',
          teamName: 'JUVENTUS',
          league: 'SERI',
          id: 1102,
          status: 'active'
        },
        {
          playerName: 'Gonzalo HIGUAIN',
          teamName: 'NAPOLI',
          league: 'SERI',
          id: 1318,
          status: 'active'
        },
        {
          playerName: 'NEYMAR',
          teamName: 'BARCELONA',
          league: 'LIGA',
          id: 14263,
          status: 'active'
        },
        {
          playerName: 'Robin VAN PERSIE',
          teamName: 'MANCHESTER UNITED',
          league: 'EPL',
          id: 1632,
          status: 'active'
        },
        {
          playerName: 'Emmanuel ADEBAYOR',
          teamName: 'TOTTENHAM',
          league: 'EPL',
          id: 1792,
          status: 'active'
        },
        {
          playerName: 'Alvaro NEGREDO',
          teamName: 'VALENCIA',
          league: 'LIGA',
          id: 1453,
          status: 'active'
        },
        {
          playerName: 'Danny WELBECK',
          teamName: 'ARSENAL',
          league: 'EPL',
          id: 1857,
          status: 'active'
        },
        {
          playerName: 'Robert LEWANDOWSKI',
          teamName: 'BAYERN MUNICH',
          league: 'CHLG',
          id: 9563,
          status: 'active'
        },
        {
          playerName: 'Luca TONI',
          teamName: 'VERONA',
          league: 'SERI',
          id: 2241,
          status: 'active'
        },
        {
          playerName: 'Raul GARCIA',
          teamName: 'ATLETICO MADRID',
          league: 'LIGA',
          id: 1505,
          status: 'active'
        },
        {
          playerName: 'Raheem STERLING',
          teamName: 'LIVERPOOL',
          league: 'EPL',
          id: 13749,
          status: 'active'
        },
        {
          playerName: 'Fabio QUAGLIARELLA',
          teamName: 'TORINO',
          league: 'SERI',
          id: 274,
          status: 'active'
        },
        {
          playerName: 'Miroslav KLOSE',
          teamName: 'LAZIO',
          league: 'SERI',
          id: 2227,
          status: 'active'
        },
        {
          playerName: 'Francesco TOTTI',
          teamName: 'ROMA',
          league: 'SERI',
          id: 336,
          status: 'active'
        },
        {
          playerName: 'Didier DROGBA',
          teamName: 'CHELSEA',
          league: 'EPL',
          id: 1730,
          status: 'active'
        },
        {
          playerName: 'Graziano PELLE',
          teamName: 'SOUTHAMPTON',
          league: 'EPL',
          id: 2716
        },
        {
          playerName: 'Emmanuel RIVIERE',
          teamName: 'NEWCASTLE',
          league: 'EPL',
          id: 30846,
          status: 'active'
        },
        {
          playerName: 'Stephan EL SHAARAWY',
          teamName: 'AC MILAN',
          league: 'SERI',
          id: 403,
          status: 'active'
        },
        {
          playerName: 'Steven FLETCHER',
          teamName: 'SUNDERLAND',
          league: 'EPL',
          id: 1550,
          status: 'active'
        },
        {
          playerName: 'Youssef EL ARABI',
          teamName: 'GRANADA',
          league: 'LIGA',
          id: 17786,
          status: 'active'
        },
        {
          playerName: 'Imanol AGIRRETXE',
          teamName: 'REAL SOCIEDAD',
          league: 'LIGA',
          id: 10171,
          status: 'active'
        },
        {
          playerName: 'Bojan KRKIC',
          teamName: 'STOKE CITY',
          league: 'EPL',
          id: 1124,
          status: 'active'
        },
        {
          playerName: 'Tomer HEMED',
          teamName: 'ALMERIA',
          league: 'LIGA',
          id: 14670,
          status: 'active'
        }

      ]
    },

    joe: {
      managerName: 'Joe',
      teamName: '-',
      players: [
        {
          playerName: 'Sergio AGUERO',
          teamName: 'MANCHESTER CITY',
          league: 'EPL',
          id: 1499,
          status: 'active'
        },
        {
          playerName: 'Mario MANDZUKIC',
          teamName: 'ATLETICO MADRID',
          league: 'LIGA',
          id: 8492,
          status: 'active'
        },
        {
          playerName: 'Olivier GIROUD',
          teamName: 'ARSENAL',
          league: 'EPL',
          id: 10689,
          status: 'active'
        },
        {
          playerName: 'Luis SUAREZ',
          teamName: 'BARCELONA',
          league: 'LIGA',
          id: 4433,
          status: 'active'
        },
        {
          playerName: 'Kevin GAMEIRO',
          teamName: 'SEVILLA',
          league: 'LIGA',
          id: 15143,
          status: 'active'
        },
        {
          playerName: 'Jose Maria CALLEJON',
          teamName: 'NAPOLI',
          league: 'SERI',
          id: 1141,
          status: 'active'
        },
        {
          playerName: 'Antoine GRIEZMANN',
          teamName: 'ATLETICO MADRID',
          league: 'LIGA',
          id: 10181,
          status: 'active'
        },
        {
          playerName: 'Rodrigo PALACIO',
          teamName: 'INTER MILAN',
          league: 'SERI',
          id: 415,
          status: 'active'
        },
        {
          playerName: 'Rickie LAMBERT',
          teamName: 'LIVERPOOL',
          league: 'EPL',
          id: 7071,
          status: 'active'
        },
        {
          playerName: 'Samuel ETO\'O',
          teamName: 'EVERTON',
          league: 'EPL',
          id: 142,
          status: 'active'
        },
        {
          playerName: 'Thomas MULLER',
          teamName: 'BAYERN MUNICH',
          league: 'CHLG',
          id: 2232,
          status: 'active'
        },
        {
          playerName: 'German DENIS',
          teamName: 'ATALANTA',
          league: 'SERI',
          id: 263,
          status: 'active'
        },
        {
          playerName: 'Jay RODRIGUEZ',
          teamName: 'SOUTHAMPTON',
          league: 'EPL',
          id: 1563,
          status: 'active'
        },
        {
          playerName: 'Alberto BUENO',
          teamName: 'RAYO VALLECANO',
          league: 'LIGA',
          id: 1362,
          status: 'active'
        },
        {
          playerName: 'EDER',
          teamName: 'SAMPDORIA',
          league: 'SERI',
          id: 11949,
          status: 'active'
        },
        {
          playerName: 'Giovani DOS SANTOS',
          teamName: 'VILLARREAL',
          league: 'LIGA',
          id: 1900,
          status: 'active'
        },
        {
          playerName: 'Antonio CANDREVA',
          teamName: 'LAZIO',
          league: 'SERI',
          id: 540,
          status: 'active'
        },
        {
          playerName: 'David SILVA',
          teamName: 'MANCHESTER CITY',
          league: 'EPL',
          id: 1354,
          status: 'active'
        },
        {
          playerName: 'Jeremy MENEZ',
          teamName: 'AC MILAN',
          league: 'SERI',
          id: 326,
          status: 'active'
        },
        {
          playerName: 'Marco REUS',
          teamName: 'BORUSSIA DORTMUND',
          league: 'CHLG',
          id: 3062,
          status: 'active'
        },
        {
          playerName: 'Munir EL HADDADI',
          teamName: 'BARCELONA',
          league: 'LIGA',
          id: 32210,
          status: 'active'
        },
        {
          playerName: 'Bafetimbi GOMIS',
          teamName: 'SWANSEA CITY',
          league: 'EPL',
          id: 3015,
          status: 'active'
        },
        {
          playerName: 'Samir NASRI',
          teamName: 'MANCHESTER CITY',
          league: 'EPL',
          id: 1622,
          status: 'active'
        },
        {
          playerName: 'Sergio RAMOS',
          teamName: 'REAL MADRID',
          league: 'LIGA',
          id: 1325,
          status: 'active'
        }
      ]
    },

    /**
     * TODO
     */
    getAllPlayers: function () {
      
      //$fireBaseService.initialize(allManagers);
      var firePromise = $fireBaseService.getFireBaseData();
      firePromise.promise.then(function(data){
        
        return data;
        
      }, function() {
        
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

  }

  return allManagers;

});