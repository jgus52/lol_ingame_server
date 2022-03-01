import prisma from "../../client";
import axios from "axios";
import { getChampData, getChampImg, getSummonerByName } from "../../shared";

const resolvers = {
  Query: {
    getAllChampInfo: async (_, { puuids }) => {
      let allyInfo = [];
      const { data: versionData } = await axios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];

      let champData = await getChampData(version);
      champData = Object.entries(champData.data);

      let champs = puuids.map((puuid) =>
        prisma.champ.findMany({
          where: {
            userId: puuid,
          },
          take: 8,
          orderBy: {
            games: "desc",
          },
        })
      );

      // for await (let summonerName of summonerIds) {
      //   if (summonerName == "") continue;
      //   //console.log(summonerName);
      //   summonerName = encodeURI(summonerName);

      //   const champInfo = await prisma.champ.findMany({
      //     where: {
      //       userId: summonerInfo.puuid,
      //     },
      //     take: 8,
      //     orderBy: {
      //       games: "desc",
      //     },
      //   });
      //   //console.log(champInfo);

      //   for await (let champ of champInfo) {
      //     const targetChamp = await champData.find(
      //       (ele) => ele[1].key == champ.id
      //     );
      //     champ.championName = targetChamp[1].id;
      //     champ.championImg = await getChampImg(version, targetChamp[1].id);
      //   }

      //   allyInfo.push({ champ: champInfo, user: summonerInfo });
      // }

      await Promise.all(champs).then((responses) => {
        responses.forEach((champInfos) =>
          champInfos.forEach((champ) => {
            const targetChamp = champData.find((ele) => ele[1].key == champ.id);
            champ.championName = targetChamp[1].id;
            champ.championImg = getChampImg(version, targetChamp[1].id);
          })
        );
      });
      //console.log(allyInfo);
      return champs;
    },
  },
};

export default resolvers;
