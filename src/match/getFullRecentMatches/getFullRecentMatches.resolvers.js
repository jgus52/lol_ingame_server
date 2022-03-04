import prisma from "../../client";
import axios from "axios";
import { getChampData, getChampImg } from "../../shared";

const resolvers = {
  Query: {
    getFullRecentMatches: async (_, { puuid, take, cursor }) => {
      //let matches = new Array(puuids.length);

      const { data: versionData } = await axios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];

      let champData = await getChampData(version);
      champData = Object.entries(champData.data);

      let matches = await prisma.matchParticipants.findMany({
        take,
        where: {
          puuid,
        },
        skip: cursor ? 1 : 0,
        cursor: cursor
          ? { matchId_puuid: { matchId: cursor, puuid } }
          : undefined,
        orderBy: {
          gameEndTimestamp: "desc",
        },
      });
      //console.log(matches);
      return matches;
    },
  },
};

export default resolvers;
