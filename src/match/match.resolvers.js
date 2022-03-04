import prisma from "../client";
import { cachedAxios, getChampData, getChampImg } from "../shared";

const resolvers = {
  Match: {
    participants: async ({ matchId }) => {
      const participants = await prisma.matchParticipants.findMany({
        where: {
          matchId,
        },
      });

      return participants;
    },
    championImg: async ({ championId }) => {
      const { data: versionData } = await cachedAxios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];

      let champData = await getChampData(version);
      champData = Object.entries(champData.data);

      const targetChamp = champData.find((c) => c[1].key == championId);

      return getChampImg(version, targetChamp[1].id);
    },
  },
  MatchParticipant: {
    championImg: async ({ championId }) => {
      const { data: versionData } = await cachedAxios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];

      let champData = await getChampData(version);
      champData = Object.entries(champData.data);

      const targetChamp = champData.find((c) => c[1].key == championId);

      return getChampImg(version, targetChamp[1].id);
    },
  },
};

export default resolvers;
