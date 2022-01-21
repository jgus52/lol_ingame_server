import prisma from "../../client";
import axios from "axios";

const updateuserInfo = async (ele) => {
  const targetChamp = await prisma.champ.findUnique({
    where: {
      id_userId: {
        id: ele.championId,
        userId: ele.puuid,
      },
    },
  });
  if (targetChamp) {
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
        win: ele.win ? 1 : 0,
        lose: ele.win ? 0 : 1,
      },
    });
  }

  const match = await prisma.match.findUnique({
    where: { matchId: ele.matchId },
  });
  const newGameDate = new Date(match.gameEndTimestamp.getTime() - 60000);
  const user = await prisma.user.findUnique({
    where: { puuid: ele.puuid },
  });
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
    const { data: matchInfo } = await axios.get(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${ele}?api_key=${process.env.RIOTAPI_KEY}`
    );
    //console.log(matchInfo);
    if (matchInfo.info.gameDuration <= 210) continue;

    const matchEndTime = new Date(matchInfo.info.gameEndTimestamp);

    let match = await prisma.match.findUnique({
      where: {
        matchId: matchInfo.metadata.matchId,
      },
    });
    if (match) continue;

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
        assist: ele.assists,
        deaths: ele.deaths,
        kills: ele.kills,
        win: ele.win,
        championId: ele.championId,
      };

      const participant = await prisma.matchParticipants.create({
        data: obj,
      });

      if (participant.puuid == puuid) updateuserInfo(participant);
    });
  }
}

const resolvers = {
  Mutation: {
    updateChampsInfo: async (_, { puuids }) => {
      try {
        //first search puuid from model users
        for (const puuid of puuids) {
          let user = await prisma.user.findUnique({ where: { puuid: puuid } });
          let savedLastGameEndTime = Date.parse(user.latestGame) / 1000;
          const now = Date.now();

          console.log(
            `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${savedLastGameEndTime}&endTime=${now}&type=ranked&start=0&count=100&api_key=${process.env.RIOTAPI_KEY}`
          );

          let unupdatedMatches = await axios.get(
            `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${savedLastGameEndTime}&endTime=${now}&type=ranked&start=0&count=100&api_key=${process.env.RIOTAPI_KEY}`
          );

          while (unupdatedMatches.data.length !== 0) {
            await updateMatch(unupdatedMatches.data, puuid);

            user = await prisma.user.findUnique({ where: { puuid: puuid } });
            savedLastGameEndTime = Date.parse(user.lastGame) / 1000;

            unupdatedMatches = await axios.get(
              `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${1641495600}&endTime=${savedLastGameEndTime}&type=ranked&start=0&count=100&api_key=${
                process.env.RIOTAPI_KEY
              }`
            );
            console.log(
              `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${1641495600}&endTime=${savedLastGameEndTime}&type=ranked&start=0&count=100&api_key=${
                process.env.RIOTAPI_KEY
              }`
            );
          }
        }

        return {
          ok: true,
        };
      } catch (e) {
        console.log(e);

        return {
          ok: false,
          error: e.response.statusText,
        };
      }
    },
  },
};

export default resolvers;
