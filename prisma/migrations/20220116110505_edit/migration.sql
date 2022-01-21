/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MatchParticipants` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "MatchParticipants" DROP CONSTRAINT "MatchParticipants_matchId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
ALTER COLUMN "matchId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("matchId");

-- AlterTable
ALTER TABLE "MatchParticipants" DROP CONSTRAINT "MatchParticipants_pkey",
ALTER COLUMN "matchId" SET DATA TYPE TEXT,
ALTER COLUMN "puuid" SET DATA TYPE TEXT,
ADD CONSTRAINT "MatchParticipants_pkey" PRIMARY KEY ("matchId");

-- AddForeignKey
ALTER TABLE "MatchParticipants" ADD CONSTRAINT "MatchParticipants_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;
