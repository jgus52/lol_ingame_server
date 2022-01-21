import prisma from "../../client";

const resolvers = {
  Query: {
    getChampInfo: async (_, { summonerIds }) => {
      let retChamp = [];

      const promises = summonerIds.map(async (summonerId) => {
        const champInfo = await prisma.champ.findMany({
          where: {
            userId: summonerId,
          },
        });
        await Promise.all(champInfo);

        retChamp.push(champInfo);
      });

      await Promise.all(promises);

      return retChamp;
    },
  },
};

export default resolvers;
