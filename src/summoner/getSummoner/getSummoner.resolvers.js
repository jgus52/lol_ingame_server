import axios from "axios";

const resolvers = {
  Query: {
    getSummoner: async (_, { summonerName }) => {
      const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.RIOTAPI_KEY}`;

      const ret = await axios.get(url);

      console.log(ret);
      return ret.data;
    },
  },
};

export default resolvers;
