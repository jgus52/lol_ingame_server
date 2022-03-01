import axios from "axios";
import { cacheAdapterEnhancer, cachedAdapterEnhancer } from "axios-extensions";
import { getChampImg, getSummonerByName } from "../../shared";
import statRunes from "../../statRunes";
import { ApolloError } from "apollo-server-express";

const resolvers = {
  Query: {
    getOpponent: async (_, { summonerName }) => {
      //try {
      const cachedAxios = axios.create({
        adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
          enabledByDefault: true,
        }),
      });
      summonerName = encodeURI(summonerName);
      const { data: versionData } = await cachedAxios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];
      const runeInfoURL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/runesReforged.json`;
      const championURL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
      const spellURL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`;

      const summonerInfo = await getSummonerByName(summonerName);
      const { data: runeInfo } = await cachedAxios.get(runeInfoURL);
      const { data: championInfo } = await cachedAxios.get(championURL);
      const { data: spellInfo } = await cachedAxios.get(spellURL);

      const ingameURL = `https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerInfo.id}?api_key=${process.env.RIOTAPI_KEY}`;
      const { data: gameInfo } = await axios.get(ingameURL).catch((error) => {
        if (error.response.status == 404) {
          throw new ApolloError("Not In Game", "404");
        }
      });
      let participants = gameInfo.participants;

      const { teamId } = participants.find(
        (ele) => ele.summonerId == summonerInfo.id
      );

      participants = participants.filter((ele) => ele.teamId != teamId);

      for await (const ele of participants) {
        let perkIcons = [];
        let perkNames = [];
        let statIcons = [];
        let perkInfos = [];

        // const summonerIdUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${ele.summonerId}?api_key=${process.env.RIOTAPI_KEY}`;
        // const { data: userInfo } = await cachedAxios.get(summonerIdUrl);
        // ele.puuid = userInfo.puuid;

        let champ = Object.entries(championInfo.data).find(
          (c) => c[1].key == ele.championId
        );
        ele.championName = champ[1].id;
        ele.championImg = getChampImg(version, champ[1].id);

        const spell1 = Object.entries(spellInfo.data).find(
          (e) => e[1].key == ele.spell1Id
        );
        const spell2 = Object.entries(spellInfo.data).find(
          (e) => e[1].key == ele.spell2Id
        );
        ele.spell1Img = `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell1[1].id}.png`;
        ele.spell2Img = `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell2[1].id}.png`;

        ele.perks.perkIds.map((e) => {
          if (statRunes.has(e))
            statIcons.push(
              `https://ddragon.leagueoflegends.com/cdn/img/${statRunes.get(e)}`
            );
          runeInfo.map((runeObj) => {
            runeObj.slots.map((runes) => {
              const rune = runes.runes.find((rune) => rune.id === e);
              if (rune) {
                perkIcons.push(
                  `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`
                );
                perkNames.push(rune.name);
                perkInfos.push(rune.shortDesc.replace(/\<[^!>)]*\>/g, ""));
              }
            });
          });
        });
        ele.perks.statIcons = statIcons;
        ele.perks.perkNames = perkNames;
        ele.perks.perkIcons = perkIcons;
        ele.perks.perkInfos = perkInfos;
      }

      return participants;
      // } catch (e) {
      //   if (e.response.status == 404) return [];
      // }
    },
  },
};

export default resolvers;
