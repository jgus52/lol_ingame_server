import axios from "axios";
import { getSummonerByName } from "../../shared";

const resolvers = {
  Query: {
    getSummonersByName: async (_, { summonerNames }) => {
      let summoners = new Array(summonerNames.length);
      let summonerRequets = summonerNames.map((name) =>
        axios.get(
          `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(
            name
          )}?api_key=${process.env.RIOTAPI_KEY}`
        )
      );

      // for await (const name of summonerNames) {
      //   const summoner = await getSummonerByName(encodeURI(name));

      //   summoners.push(summoner);
      // }

      await Promise.all(summonerRequets).then((responses) =>
        responses.forEach((ele, index) => {
          const { data: summoner } = ele;

          summoners[index] = summoner;
        })
      );

      return summoners;
    },
  },
};

export default resolvers;
