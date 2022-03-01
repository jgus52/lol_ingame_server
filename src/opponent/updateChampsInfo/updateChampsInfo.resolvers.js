import prisma from "../../client";
import axios from "axios";
import { getSummonerByPuuid } from "../../shared";

const updateChamp = async (ele) => {
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
      lastGame: user.lastGame > newGameDate ? newGameDate : user.lastGame,
      latestGame: user.latestGame < newGameDate ? newGameDate : user.latestGame,
    },
  });

  //console.log(match.gameEndTimestamp, user.lastGame);
  //console.log(user.lastGame, user.latestGame);
};

const addMatchParticipants = async (unupdatedMatches, puuid) => {
  // const lastGame = unupdatedMatches[unupdatedMatches.length - 1];
  // const latestGame = unupdatedMatches[0];

  let matchRequests = unupdatedMatches.map(async (ele) => {
    let match = await prisma.match.findUnique({
      where: {
        matchId: ele,
      },
    });

    if (match === null)
      return axios.get(
        `https://asia.api.riotgames.com/lol/match/v5/matches/${ele}?api_key=${process.env.RIOTAPI_KEY}`
      );
    else {
      const participant = await prisma.matchParticipants.findUnique({
        where: {
          matchId_puuid: {
            matchId: ele,
            puuid: puuid,
          },
        },
      });
      updateChamp(participant);
    }
  });
  //console.log(needBeUpdate);
  let needBeUpdate = new Array(matchRequests.length);

  await Promise.all(matchRequests).then(async (responses) => {
    responses.forEach((response, index) => {
      const { data: matchInfo } = response;

      needBeUpdate[index] = matchInfo;
    });
  });

  let prismaCreateMatches = needBeUpdate.map((matchInfo) => {
    if (matchInfo.info.gameDuration <= 210) return;
    const matchEndTime = new Date(matchInfo.info.gameEndTimestamp);
    return prisma.match.create({
      data: {
        matchId: matchInfo.metadata.matchId,
        gameEndTimestamp: matchEndTime,
      },
    });
  });

  await Promise.all(prismaCreateMatches);

  let participants = needBeUpdate.map(async (matchInfo) => {
    const matchEndTime = new Date(matchInfo.info.gameEndTimestamp);
    const matchParticipants = matchInfo.info.participants.map((ele) =>
      prisma.matchParticipants.create({
        data: {
          match: {
            connect: {
              matchId: matchInfo.metadata.matchId,
            },
          },
          puuid: ele.puuid,
          gameEndTimestamp: matchEndTime,
          assist: ele.assists,
          deaths: ele.deaths,
          kills: ele.kills,
          win: ele.win,
          championId: ele.championId,
        },
      })
    );

    let champ;
    await Promise.all(matchParticipants).then(async (responses, index) => {
      champ = responses.find((ele) => ele.puuid === puuid);
    });

    return champ;
  });

  await Promise.all(participants).then(async () => {
    for await (const champ of participants) {
      await updateChamp(champ);
    }
  });

  //for (const ele of unupdatedMatches) {
  //console.log(ele);
  // let match = await prisma.match.findUnique({
  //   where: {
  //     matchId: ele,
  //   },
  // });
  // //console.log(match.matchId);
  // if (!match) {
  //   const matchUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${ele}?api_key=${process.env.RIOTAPI_KEY}`;
  //   const { data: matchInfo } = await axios.get(matchUrl);
  //   //console.log(matchInfo);
  //   if (matchInfo.info.gameDuration <= 210) continue;
  //   const matchEndTime = new Date(matchInfo.info.gameEndTimestamp);
  //   match = await prisma.match.create({
  //     data: {
  //       matchId: matchInfo.metadata.matchId,
  //       gameEndTimestamp: matchEndTime,
  //     },
  //   });
  //   for await (const ele of matchInfo.info.participants) {
  //     const obj = {
  //       match: {
  //         connect: {
  //           matchId: match.matchId,
  //         },
  //       },
  //       puuid: ele.puuid,
  //       gameEndTimestamp: match.gameEndTimestamp,
  //       assist: ele.assists,
  //       deaths: ele.deaths,
  //       kills: ele.kills,
  //       win: ele.win,
  //       championId: ele.championId,
  //     };
  //     const participant = await prisma.matchParticipants.create({
  //       data: obj,
  //     });
  //     if (ele.puuid == puuid) await updateChamp(participant);
  //   }
  // } else {
  //   //getLeagueInfo를 한 뒤에 받기 때문에 갱신이 완료된 상태에서 호출된다.
  //   const participant = await prisma.matchParticipants.findUnique({
  //     where: {
  //       matchId_puuid: {
  //         matchId: ele,
  //         puuid: puuid,
  //       },
  //     },
  //   });
  //   await updateChamp(participant);
  // }
  //}
};

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

          let matchesUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${savedLastGameEndTime}&endTime=${now}&queue=420&start=0&count=10&api_key=${process.env.RIOTAPI_KEY}`;
          //console.log(matchesUrl);

          let unupdatedMatches = await axios.get(matchesUrl);
          addMatchParticipants(unupdatedMatches.data, puuid);

          do {
            await addMatchParticipants(unupdatedMatches.data, puuid);

            user = await prisma.user.findUnique({ where: { puuid: puuid } });
            savedLastGameEndTime = (Date.parse(user.lastGame) - 60000) / 1000;
            //console.log(savedLastGameEndTime);

            matchesUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${1641495600}&endTime=${savedLastGameEndTime}&queue=420&start=0&count=10&api_key=${
              process.env.RIOTAPI_KEY
            }`;

            //console.log(matchesUrl);
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
