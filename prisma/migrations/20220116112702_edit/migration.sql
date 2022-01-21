/*
  Warnings:

  - The primary key for the `MatchParticipants` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "MatchParticipants_puuid_key";

-- AlterTable
ALTER TABLE "MatchParticipants" DROP CONSTRAINT "MatchParticipants_pkey",
ADD CONSTRAINT "MatchParticipants_pkey" PRIMARY KEY ("matchId", "puuid");
