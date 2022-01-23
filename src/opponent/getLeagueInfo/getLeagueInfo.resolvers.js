import prisma from "../../client";
import axios from "axios";

const resolvers = {
  Query: {
    getLeagueInfo: async (_, { summonerIds }) => {
      let leagueInfos = [];

      const promises = summonerIds.map(async (ele) => {
        const { data: league } = await axios.get(
          `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${ele}?api_key=${process.env.RIOTAPI_KEY}`
        );

        let soloRankInfo = {
          tier: "During",
          rank: "Placement",
          leaguePoints: 0,
          wins: 0,
          losses: 0,
        };

        league.map((ele) => {
          if (ele?.queueType == "RANKED_SOLO_5x5") {
            //console.log(league[0]);
            soloRankInfo = ele;
          }
        });

        leagueInfos.push(soloRankInfo);

        const user = await prisma.user.findUnique({
          where: { summonerId: ele },
        });

        if (!user) {
          const seasonBeginDate = new Date(1641495600000);
          const summonerURL = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${ele}?api_key=${process.env.RIOTAPI_KEY}`;
          const { data: newUser } = await axios.get(summonerURL);
          await prisma.user.create({
            data: {
              puuid: newUser.puuid,
              summonerId: newUser.id,
              summonerName: newUser.name,
              totalWin: soloRankInfo.wins,
              totalLose: soloRankInfo.losses,
              rank: soloRankInfo.rank,
              tier: soloRankInfo.tier,
              lastGame: new Date(Date.now()),
              latestGame: seasonBeginDate,
            },
          });
        } else {
          await prisma.user.update({
            where: {
              summonerId: ele,
            },
            data: {
              totalWin: soloRankInfo.wins,
              totalLose: soloRankInfo.losses,
              rank: soloRankInfo.rank,
              tier: soloRankInfo.tier,
            },
          });
        }
      });

      await Promise.all(promises);

      return leagueInfos;
    },
  },
};

export default resolvers;
