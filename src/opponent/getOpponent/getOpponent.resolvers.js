import axios from "axios";

const resolvers = {
  Query: {
    getSummoner: async (_, { summonerName }) => {
      const summonerURL = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.RIOTAPI_KEY}`;

      const { data: summonerInfo } = await axios.get(summonerURL);

      console.log(ret);
      return ret.data;
    },
  },
};

export default resolvers;
