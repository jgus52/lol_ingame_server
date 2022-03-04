import prisma from "../../client";
import axios from "axios";
import { getChampData, getChampImg, getSummonerByName } from "../../shared";

const resolvers = {
  Query: {
    getAllChampInfo: async (_, { puuids, take, cursor }) => {
      const { data: versionData } = await axios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];

      let champData = await getChampData(version);
      champData = Object.entries(champData.data);

      let champs = puuids.map((puuid) =>
        prisma.champ.findMany({
          where: {
            puuid: puuid,
          },
          take,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id_puuid: { id: cursor, puuid } } : undefined,
          orderBy: {
            games: "desc",
          },
        })
      );

      await Promise.all(champs).then((responses) => {
        responses.forEach((champInfos) =>
          champInfos.forEach((champ) => {
            const targetChamp = champData.find((ele) => ele[1].key == champ.id);
            champ.championName = targetChamp[1].id;
            champ.championImg = getChampImg(version, targetChamp[1].id);
          })
        );
      });

      return champs;
    },
  },
};

export default resolvers;
