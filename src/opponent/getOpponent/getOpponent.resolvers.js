import axios from "axios";
import statRunes from "../../statRunes";

const resolvers = {
  Query: {
    getOpponent: async (_, { summonerName }) => {
      summonerName = encodeURI(summonerName);
      const { data: versionData } = await axios.get(
        `https://ddragon.leagueoflegends.com/api/versions.json`
      );
      const version = versionData[0];
      const summonerURL = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.RIOTAPI_KEY}`;
      const runeInfoURL = `http://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/runesReforged.json`;
      const championURL = `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
      const spellURL = `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`;

      const { data: summonerInfo } = await axios.get(summonerURL);
      const { data: runeInfo } = await axios.get(runeInfoURL);
      const { data: championInfo } = await axios.get(championURL);
      const { data: spellInfo } = await axios.get(spellURL);

      const ingameURL = `https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerInfo.id}?api_key=${process.env.RIOTAPI_KEY}`;
      const { data: gameInfo } = await axios.get(ingameURL);
      let participants = gameInfo.participants;

      const { teamId } = participants.find(
        (ele) => ele.summonerId == summonerInfo.id
      );

      participants = participants.filter((ele) => ele.teamId != teamId);

      participants.map(async (ele) => {
        let perkIcons = [];
        let perkNames = [];
        let statIcons = [];
        let perkInfos = [];

        for (let e in championInfo.data) {
          if (championInfo.data[e].key == ele.championId) {
            ele.championName = championInfo.data[e].name;
            ele.championName = ele.championName.replace(/[^a-z|A-Z]/gi, "");
          }
        }
        for (let e in spellInfo.data) {
          if (spellInfo.data[e].key == ele.spell1Id)
            ele.spell1Name = spellInfo.data[e].id;
          if (spellInfo.data[e].key == ele.spell2Id)
            ele.spell2Name = spellInfo.data[e].id;
        }
        ele.perks.perkIds.map((e) => {
          if (statRunes.has(e)) statIcons.push(statRunes.get(e));
          runeInfo.map((runeObj) => {
            runeObj.slots.map((runes) => {
              runes.runes.map((rune) => {
                if (rune.id == e) {
                  perkIcons.push(rune.icon);
                  perkNames.push(rune.name);
                  perkInfos.push(rune.shortDesc);
                }
              });
            });
          });
        });
        ele.perks.statIcons = statIcons;
        ele.perks.perkNames = perkNames;
        ele.perks.perkIcons = perkIcons;
        ele.perks.perkInfos = perkInfos;
      });

      //console.log(participants);
      return participants;
    },
  },
};

export default resolvers;
