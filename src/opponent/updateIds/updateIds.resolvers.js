import prisma from "../../client";
import { getSummonerByName } from "../../shared";

const resolvers = {
  Mutation: {
    updateIds: async (_, { summonerNames }) => {
      for await (let ele of summonerNames) {
        if (ele === "") continue;
        const checkUser = await prisma.user.findUnique({
          where: { summonerName: ele },
        });
        const user = await getSummonerByName(encodeURI(ele));

        if (!checkUser) {
          //없으면 새로 유저 테이블 생성
          await prisma.user.create({
            data: {
              puuid: user.puuid,
              summonerId: user.id,
              summonerName: user.name,
            },
          });
        } else if (checkUser) {
          //console.log("else if checkUser");
          if (checkUser.puuid !== user.puuid) {
            //console.log("checkUser.puuid!== user.puuid");
            await prisma.user.update({
              where: {
                puuid: checkUser.puuid,
              },
              data: {
                summonerName: user.name,
                puuid: user.puuid,
                summonerId: user.id,
              },
            });
          }
        }
      }

      return true;
    },
  },
};

export default resolvers;
