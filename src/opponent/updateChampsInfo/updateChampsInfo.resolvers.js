import prisma from "../../client";
import axios from "axios";
import { getSummonerByPuuid } from "../../shared";

const updateChamp = async (ele) => {
  const targetChamp = await prisma.champ.findUnique({
    where: {
      id_puuid: {
        id: ele.championId,
        puuid: ele.puuid,
      },
    },
  });
  if (targetChamp) {
    let updateGames = 0;
    if (targetChamp.games != targetChamp.win + targetChamp.lose)
      updateGames = targetChamp.win + targetChamp.lose;

    await prisma.champ.update({
      where: {
        id_puuid: {
          id: ele.championId,
          puuid: ele.puuid,
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
          increment: ele.assists,
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
        assist: ele.assists,
        games: 1,
        win: ele.win ? 1 : 0,
        lose: ele.win ? 0 : 1,
      },
    });
  }
};

const addMatchParticipants = async (unupdatedMatches) => {
  let matchRequests = [];
  for await (let ele of unupdatedMatches) {
    let match = await prisma.match.findUnique({
      where: {
        matchId: ele,
      },
    });
    if (match === null)
      matchRequests.push(
        axios.get(
          `https://asia.api.riotgames.com/lol/match/v5/matches/${ele}?api_key=${process.env.RIOTAPI_KEY}`
        )
      );
  }
  let needBeUpdate = new Array(matchRequests.length);
  await Promise.all(matchRequests).then(async (responses) => {
    responses.forEach((response, index) => {
      const { data: matchInfo } = response;

      needBeUpdate[index] = matchInfo;
    });
  });

  let createMatches = [];
  needBeUpdate.forEach((matchInfo) => {
    if (matchInfo.info.gameDuration <= 210) return;
    const matchEndTime = new Date(matchInfo.info.gameEndTimestamp);
    createMatches.push(
      prisma.match.create({
        data: {
          matchId: matchInfo.metadata.matchId,
          gameEndTimestamp: matchEndTime,
        },
      })
    );
  });

  let participants;
  //매치 생성
  await Promise.all(createMatches).then(async () => {
    for await (let matchInfo of needBeUpdate) {
      if (matchInfo.info.gameDuration <= 210) continue;
      for await (let ele of matchInfo.info.participants) {
        let user = await prisma.user.findUnique({
          where: { puuid: ele.puuid },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              puuid: ele.puuid,
              summonerId: ele.summonerId,
              summonerName: ele.summonerName,
            },
          });
        }
      }
    }

    participants = [];
    needBeUpdate.forEach(async (matchInfo) => {
      if (matchInfo.info.gameDuration <= 210) return;
      const matchEndTime = new Date(matchInfo.info.gameEndTimestamp);
      const matchParticipants = matchInfo.info.participants.map(async (ele) => {
        return prisma.matchParticipants.create({
          data: {
            match: {
              connect: {
                matchId: matchInfo.metadata.matchId,
              },
            },
            user: {
              connect: {
                puuid: ele.puuid,
              },
            },
            gameEndTimestamp: matchEndTime,
            assist: ele.assists,
            deaths: ele.deaths,
            kills: ele.kills,
            win: ele.win,
            championId: ele.championId,
          },
        });
      });

      participants.push(matchParticipants);
    });
  });

  await Promise.all(participants).then(async () => {
    for await (const matchInfo of needBeUpdate) {
      if (matchInfo.info.gameDuration <= 210) continue;
      for await (const ele of matchInfo.info.participants) {
        await updateChamp(ele);
      }
    }
  });
};

const resolvers = {
  Mutation: {
    updateChampsInfo: async (_, { puuids }) => {
      try {
        for (const puuid of puuids) {
          let latestMatch = await prisma.matchParticipants.findFirst({
            where: {
              puuid,
            },
            orderBy: {
              gameEndTimestamp: "desc",
            },
          });

          let matchesUrl;
          if (latestMatch !== null) {
            let savedLatestGameEndTime =
              (Date.parse(latestMatch.gameEndTimestamp) + 60000) / 1000;
            const now = Date.now();

            matchesUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${savedLatestGameEndTime}&endTime=${now}&queue=420&start=0&count=10&api_key=${process.env.RIOTAPI_KEY}`;
          } else {
            matchesUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=10&api_key=${process.env.RIOTAPI_KEY}`;
          }

          let unupdatedMatches = await axios.get(matchesUrl);
          do {
            await addMatchParticipants(unupdatedMatches.data);

            let lastMatch = await prisma.matchParticipants.findFirst({
              where: {
                puuid,
              },
              orderBy: {
                gameEndTimestamp: "asc",
              },
            });

            let savedLastGameEndTime =
              (Date.parse(lastMatch.gameEndTimestamp) - 60000) / 1000;

            matchesUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${1641495600}&endTime=${savedLastGameEndTime}&queue=420&start=0&count=10&api_key=${
              process.env.RIOTAPI_KEY
            }`;

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
