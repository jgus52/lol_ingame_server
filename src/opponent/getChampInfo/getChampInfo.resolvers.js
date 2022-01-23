import prisma from "../../client";

const resolvers = {
  Query: {
    getChampInfo: async (_, { summonerIds, championIds }) => {
      let retChamp = [];
      //console.log(retChamp);

      const promises = summonerIds.map(async (summonerId, index) => {
        //console.log(championIds);
        const champInfo = await prisma.champ.findUnique({
          where: {
            id_userId: {
              id: championIds[index],
              userId: summonerId,
            },
          },
        });
        console.log(champInfo);

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
      });

      //console.log(retChamp);
      await Promise.all(promises);

      //console.log(retChamp);
      return retChamp;
    },
  },
};

export default resolvers;
