-- DropForeignKey
ALTER TABLE "Champ" DROP CONSTRAINT "Champ_userId_fkey";

-- AddForeignKey
ALTER TABLE "MatchParticipants" ADD CONSTRAINT "MatchParticipants_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "User"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Champ" ADD CONSTRAINT "Champ_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;
