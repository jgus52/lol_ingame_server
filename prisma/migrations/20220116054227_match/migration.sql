/*
  Warnings:

  - Added the required column `championName` to the `Champ` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Champ_userId_key";

-- AlterTable
ALTER TABLE "Champ" ADD COLUMN     "championName" TEXT NOT NULL,
ADD CONSTRAINT "Champ_pkey" PRIMARY KEY ("id", "userId");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "totalWin" DROP NOT NULL,
ALTER COLUMN "totalLose" DROP NOT NULL,
ALTER COLUMN "rank" DROP NOT NULL,
ALTER COLUMN "tier" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Match" (
    "matchId" INTEGER NOT NULL,
    "gameEndTimesstamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "MatchParticipants" (
    "matchId" INTEGER NOT NULL,
    "puuid" INTEGER NOT NULL,
    "assist" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "win" BOOLEAN NOT NULL,
    "championId" INTEGER NOT NULL,

    CONSTRAINT "MatchParticipants_pkey" PRIMARY KEY ("matchId")
);

-- AddForeignKey
ALTER TABLE "MatchParticipants" ADD CONSTRAINT "MatchParticipants_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;
