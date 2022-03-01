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
        // console.log(user);
        // console.log(checkUser);

        if (!checkUser) {
          //없으면 새로 유저 테이블 생성
          const seasonBeginDate = new Date(1641495600000);

          await prisma.user.create({
            data: {
              puuid: user.puuid,
              summonerId: user.id,
              summonerName: user.name,
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
              prisma.user.update({
                where: {
                  summonerId: ele,
                },
                data: {
                  puuid: user.puuid,
                  summonerId: user.id,
                  summonerName: user.name,
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
                prisma.user.update({
                  where: {
                    summonerId: ele,
                  },
                  data: {
                    puuid: user.puuid,
                    summonerId: user.id,
                    summonerName: user.name,
                  },
                });

                const matches = await prisma.matchParticipants.findMany({
                  where: {
                    puuid: checkUser.puuid,
                  },
                });
                for await (let match of matches) {
                  prisma.matchParticipants.update({
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
                prisma.user.delete({
                  where: {
                    summonerId: ele,
                  },
                });

                const seasonBeginDate = new Date(1641495600000);

                prisma.user.create({
                  data: {
                    puuid: user.puuid,
                    summonerId: user.id,
                    summonerName: user.name,
                    lastGame: new Date(Date.now()),
                    latestGame: seasonBeginDate,
                  },
                });
              }
            }
          }
        } else {
          prisma.user.update({
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

      return true;
    },
  },
};

export default resolvers;
