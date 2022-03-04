-- AddForeignKey
ALTER TABLE "MatchParticipants" ADD CONSTRAINT "MatchParticipants_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "User"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;
