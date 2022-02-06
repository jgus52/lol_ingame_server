import prisma from "../../client";
import axios from "axios";
import { getMatchInfo } from "../../shared";

const resolvers = {
  Mutation: {
    getLeagueInfo: async (_, { summonerIds }) => {
      let leagueInfos = [];

      //const promises = summonerIds.map(async (ele) => {
      for await (const ele of summonerIds) {
        const leagueUrl = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${ele}?api_key=${process.env.RIOTAPI_KEY}`;
        const { data: league } = await axios.get(leagueUrl);

        const summonerURL = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${ele}?api_key=${process.env.RIOTAPI_KEY}`;
        const { data: user } = await axios.get(summonerURL);

        let soloRankInfo = {
          tier: "During",
          rank: "Placement",
          leaguePoints: 0,
          wins: 0,
          losses: 0,
        };

        league.map((ele) => {
          if (ele?.queueType == "RANKED_SOLO_5x5") {
            //console.log(league[0]);
            soloRankInfo = ele;
          }
        });

        leagueInfos.push(soloRankInfo);

        const checkUser = await prisma.user.findUnique({
          where: { summonerName: user.name },
        });
        //기존 유저가 있는지 확인한다.

        if (!checkUser) {
          //없으면 새로 유저 테이블 생성
          const seasonBeginDate = new Date(1641495600000);

          await prisma.user.create({
            data: {
              puuid: user.puuid,
              summonerId: user.id,
              summonerName: user.name,
              totalWin: soloRankInfo.wins,
              totalLose: soloRankInfo.losses,
              rank: soloRankInfo.rank,
              tier: soloRankInfo.tier,
              lastGame: new Date(Date.now()),
              latestGame: seasonBeginDate,
            },
          });
        } else if (checkUser) {
          //console.log("else if checkUser");
          if (checkUser.puuid !== user.puuid) {
            //console.log("checkUser.puuid!== user.puuid");
            //puuid가 변경되어 갱신이 필요하다.
            //매칭이 있는지 확인하고
            const match = await prisma.matchParticipants.findFirst({
              where: {
                puuid: checkUser.puuid,
              },
            });

            if (!match) {
              //일치하는 매치가 없다면 그냥 업데이트 해주면 된다.
              await prisma.user.update({
                where: {
                  summonerId: ele,
                },
                data: {
                  puuid: user.puuid,
                  summonerId: user.id,
                  summonerName: user.name,
                  totalWin: soloRankInfo.wins,
                  totalLose: soloRankInfo.losses,
                  rank: soloRankInfo.rank,
                  tier: soloRankInfo.tier,
                },
              });

              continue;
            } else {
              //일치하는 매칭이 하나라도 있다면
              //매치 아이디로 매칭을 다시 찾아 summonerInfo를 변경해줘야 한다.
              const matchInfo = await getMatchInfo(match.matchId);

              if (
                //새로 바뀐 아이디의 유저가 동일한 경우
                matchInfo.info.participants.find(
                  (ele) => ele.puuid == user.puuid
                ) !== undefined
              ) {
                //유저의 내용과 바뀌기 전 매치 내역들을 모두 수정한다.
                await prisma.user.update({
                  where: {
                    summonerId: ele,
                  },
                  data: {
                    puuid: user.puuid,
                    summonerId: user.id,
                    summonerName: user.name,
                    totalWin: soloRankInfo.wins,
                    totalLose: soloRankInfo.losses,
                    rank: soloRankInfo.rank,
                    tier: soloRankInfo.tier,
                  },
                });

                const matches = await prisma.matchParticipants.findMany({
                  where: {
                    puuid: checkUser.puuid,
                  },
                });
                for await (let match of matches) {
                  await prisma.matchParticipants.update({
                    where: {
                      matchId_puuid: {
                        matchId: match.matchId,
                        puuid: checkUser.puuid,
                      },
                    },
                    data: {
                      puuid: user.puuid,
                    },
                  });
                }
              } else {
                //바뀐 값이 아예 다른 계정의 정보라면 기존 정보들을 삭제한다.
                await prisma.user.delete({
                  where: {
                    summonerId: ele,
                  },
                });

                const seasonBeginDate = new Date(1641495600000);

                await prisma.user.create({
                  data: {
                    puuid: user.puuid,
                    summonerId: user.id,
                    summonerName: user.name,
                    totalWin: soloRankInfo.wins,
                    totalLose: soloRankInfo.losses,
                    rank: soloRankInfo.rank,
                    tier: soloRankInfo.tier,
                    lastGame: new Date(Date.now()),
                    latestGame: seasonBeginDate,
                  },
                });
              }
            }
          }
        } else {
          await prisma.user.update({
            where: {
              summonerId: ele,
            },
            data: {
              summonerNmae: user.name,
              totalWin: soloRankInfo.wins,
              totalLose: soloRankInfo.losses,
              rank: soloRankInfo.rank,
              tier: soloRankInfo.tier,
            },
          });
        }
      }

      //console.log(summonerIds);
      //console.log(leagueInfos);
      return leagueInfos;
    },
  },
};

export default resolvers;
