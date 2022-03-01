import { getSummonerByName, getSummonerByPuuid } from "../../shared";

const resolvers = {
  Query: {
    getSummonersByIds: async (_, { puuids }) => {
      let summoners = [];
      for await (const id of puuids) {
        const summoner = await getSummonerByPuuid(id);

        summoners.push(summoner);
      }

      return summoners;
    },
  },
};

export default resolvers;
