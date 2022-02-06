import prisma from "../../client";
import axios from "axios";
import { getSummonerByPuuid } from "../../shared";

const updateuserInfo = async (ele) => {
  const user = await prisma.user.findUnique({
    where: {
      puuid: ele.puuid,
    },
  });

  const targetChamp = await prisma.champ.findUnique({
    where: {
      id_userId: {
        id: ele.championId,
        userId: ele.puuid,
      },
    },
  });
  if (targetChamp) {
    let updateGames = 0;
    if (targetChamp.games != targetChamp.win + targetChamp.lose)
      updateGames = targetChamp.win + targetChamp.lose;

    await prisma.champ.update({
      where: {
        id_userId: {
          id: ele.championId,
          userId: ele.puuid,
        },
      },
      data: {
        kill: {
          increment: ele.kills,
        },
        death: {
          increment: ele.deaths,
        },
        assist: {
          increment: ele.assist,
        },
        games: updateGames !== 0 ? { updateGames } : { increment: 1 },
        win: {
          increment: ele.win ? 1 : 0,
        },
        lose: {
          increment: ele.win ? 0 : 1,
        },
      },
    });
  } else {
    await prisma.champ.create({
      data: {
        user: {
          connect: {
            puuid: ele.puuid,
          },
        },
        id: ele.championId,
        kill: ele.kills,
        death: ele.deaths,
        assist: ele.assist,
        games: 1,
        win: ele.win ? 1 : 0,
        lose: ele.win ? 0 : 1,
      },
    });
  }
  const match = await prisma.match.findUnique({
    where: { matchId: ele.matchId },
  });
  const newGameDate = new Date(match.gameEndTimestamp.getTime());
  await prisma.user.update({
    where: {
      puuid: ele.puuid,
    },
    data: {
      lastGame: user.lastGame > newGameDate ? newGameDate : user.lastGmae,
      latestGame: user.latestGame < newGameDate ? newGameDate : user.latestGame,
    },
  });
};

async function updateMatch(unupdatedMatches, puuid) {
  for (const ele of unupdatedMatches) {
    let match = await prisma.match.findUnique({
      where: {
        matchId: ele,
      },
    });

    if (!match) {
      const matchUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${ele}?api_key=${process.env.RIOTAPI_KEY}`;
      const { data: matchInfo } = await axios.get(matchUrl);
      //console.log(matchInfo);
      if (matchInfo.info.gameDuration <= 210) continue;

      const matchEndTime = new Date(matchInfo.info.gameEndTimestamp);

      match = await prisma.match.create({
        data: {
          matchId: matchInfo.metadata.matchId,
          gameEndTimestamp: matchEndTime,
        },
      });

      matchInfo.info.participants.map(async (ele) => {
        const obj = {
          match: {
            connect: {
              matchId: match.matchId,
            },
          },
          puuid: ele.puuid,
          gameEndTimestamp: match.gameEndTimestamp,
          assist: ele.assists,
          deaths: ele.deaths,
          kills: ele.kills,
          win: ele.win,
          championId: ele.championId,
        };

        const participant = await prisma.matchParticipants.create({
          data: obj,
        });

        if (ele.puuid == puuid) updateuserInfo(participant);
      });
    } else {
      //getLeagueInfo를 한 뒤에 받기 때문에 갱신이 완료된 상태에서 호출된다.
      const participant = await prisma.matchParticipants.findUnique({
        where: {
          matchId_puuid: {
            matchId: ele,
            puuid: puuid,
          },
        },
      });

      updateuserInfo(participant);
    }
  }
}

const resolvers = {
  Mutation: {
    updateChampsInfo: async (_, { puuids }) => {
      try {
        //first search puuid from model users
        for (const puuid of puuids) {
          let user = await prisma.user.findUnique({ where: { puuid: puuid } });

          let savedLastGameEndTime =
            (Date.parse(user.latestGame) + 60000) / 1000;
          const now = Date.now();

          let matchesUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${savedLastGameEndTime}&endTime=${now}&queue=420&start=0&count=100&api_key=${process.env.RIOTAPI_KEY}`;
          console.log(matchesUrl);

          let unupdatedMatches = await axios.get(matchesUrl);

          do {
            await updateMatch(unupdatedMatches.data, puuid);

            user = await prisma.user.findUnique({ where: { puuid: puuid } });
            savedLastGameEndTime = (Date.parse(user.lastGame) - 60000) / 1000;

            matchesUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${1641495600}&endTime=${savedLastGameEndTime}&queue=420&start=0&count=100&api_key=${
              process.env.RIOTAPI_KEY
            }`;

            console.log(matchesUrl);
            unupdatedMatches = await axios.get(matchesUrl);
          } while (unupdatedMatches.data.length !== 0);
        }

        return {
          ok: true,
        };
      } catch (e) {
        console.log(e.response.statusText);
        const errorMessage = e.response.statusText;
        console.log(errorMessage);

        return {
          ok: false,
          error: errorMessage,
        };
      }
    },
  },
};

export default resolvers;
