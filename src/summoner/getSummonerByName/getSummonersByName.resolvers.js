import axios from "axios";
import { getSummonerByName } from "../../shared";

const resolvers = {
  Query: {
    getSummonersByName: async (_, { summonerNames }) => {
      let summoners = new Array();
      let summonerRequets = summonerNames.map((name) => {
        if (name === "") return null;
        return axios.get(
          `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(
            name
          )}?api_key=${process.env.RIOTAPI_KEY}`
        );
      });

      // for await (const name of summonerNames) {
      //   const summoner = await getSummonerByName(encodeURI(name));

      //   summoners.push(summoner);
      // }

      await Promise.all(summonerRequets).then((responses) =>
        responses.forEach((ele, index) => {
          if (ele === null) return;
          const { data: summoner } = ele;

          summoners.push(summoner);
        })
      );

      return summoners;
    },
  },
};

export default resolvers;
