import axios from "axios";
const resolvers = {
  Query: {
    getSummoner: async (_, { summonerName }) => {
      const { data: versionData } = await axios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];

      const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(
        summonerName
      )}?api_key=${process.env.RIOTAPI_KEY}`;
      const { data: summoner } = await axios.get(url);

      summoner.profileIcon = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`;
      return summoner;
    },
  },
};

export default resolvers;
