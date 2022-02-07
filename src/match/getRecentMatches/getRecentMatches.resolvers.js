import prisma from "../../client";
import axios from "axios";
import { getChampData, getChampImg } from "../../shared";

const resolvers = {
  Query: {
    getRecentMatches: async (_, { puuids }) => {
      let matches = [];

      const { data: versionData } = await axios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];

      let champData = await getChampData(version);
      champData = Object.entries(champData.data);

      for await (const puuid of puuids) {
        const match = await prisma.matchParticipants.findMany({
          take: 8,
          where: {
            puuid,
          },
          orderBy: {
            gameEndTimestamp: "desc",
          },
        });

        for await (let ele of match) {
          const targetChamp = await champData.find(
            (c) => c[1].key == ele.championId
          );
          ele.championImg = await getChampImg(version, targetChamp[1].id);
        }

        matches.push(match);
      }

      //console.log(matches);
      return matches;
    },
  },
};

export default resolvers;
