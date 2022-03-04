-- DropForeignKey
ALTER TABLE "MatchParticipants" DROP CONSTRAINT "MatchParticipants_matchId_fkey";

-- AddForeignKey
ALTER TABLE "MatchParticipants" ADD CONSTRAINT "MatchParticipants_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;
