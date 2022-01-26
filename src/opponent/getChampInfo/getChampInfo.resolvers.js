import prisma from "../../client";

const resolvers = {
  Query: {
    getChampInfo: async (_, { summonerIds, championIds }) => {
      let retChamp = [];

      for await (const [index, summonerId] of summonerIds.entries()) {
        const champInfo = await prisma.champ.findUnique({
          where: {
            id_userId: {
              id: championIds[index],
              userId: summonerId,
            },
          },
        });
        //console.log(champInfo);

        if (!champInfo) {
          retChamp.push({
            win: null,
            lose: null,
            kill: null,
            death: null,
            assist: null,
          });
        } else {
          retChamp.push({
            win: champInfo.win,
            lose: champInfo.lose,
            kill: champInfo.kill,
            death: champInfo.death,
            assist: champInfo.assist,
          });
        }
      }

      return retChamp;
    },
  },
};

export default resolvers;
