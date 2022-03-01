import prisma from "../../client";
import axios from "axios";
import { getMatchInfo } from "../../shared";

const resolvers = {
  Query: {
    getLeagueInfo: async (_, { summonerIds }) => {
      let leagueInfos = new Array(summonerIds.length);

      const leagueUrls = new Array(summonerIds.length);
      summonerIds.map((ele, index) => {
        leagueUrls[
          index
        ] = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${ele}?api_key=${process.env.RIOTAPI_KEY}`;
      });

      const requets = leagueUrls.map((url) => axios.get(url));

      await Promise.all(requets).then((responses) =>
        responses.forEach((response, index) => {
          const { data: league } = response;
          let soloRankInfo = league.find(
            (ele) => ele?.queueType == "RANKED_SOLO_5x5"
          );
          if (soloRankInfo === undefined) {
            soloRankInfo = {
              tier: "During",
              rank: "Placement",
              leaguePoints: 0,
              wins: 0,
              losses: 0,
            };
          }

          leagueInfos[index] = soloRankInfo;
        })
      );

      //console.log(summonerIds);
      //console.log(leagueInfos);
      return leagueInfos;
    },
  },
};

export default resolvers;
