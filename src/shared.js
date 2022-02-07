import axios from "axios";
import prisma from "./client";

export const getSummonerByName = async (summonerName) => {
  const summonerURL = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.RIOTAPI_KEY}`;

  const { data: summonerInfo } = await axios.get(summonerURL);

  return summonerInfo;
};

export const getSummonerByPuuid = async (puuid) => {
  const summonerURL = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOTAPI_KEY}`;

  const { data: summonerInfo } = await axios.get(summonerURL);

  return summonerInfo;
};

export const getMatchInfo = async (puuid) => {
  const matchUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${puuid}?api_key=${process.env.RIOTAPI_KEY}`;

  const { data: matchInfo } = await axios.get(matchUrl);

  return matchInfo;
};

export const getChampData = async (version) => {
  const championURL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;

  const { data: championInfo } = await axios.get(championURL);

  return championInfo;
};

export const getChampImg = async (version, champName) => {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champName}.png`;
};
