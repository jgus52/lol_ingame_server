/*
  Warnings:

  - You are about to drop the column `gameEndTimesstamp` on the `Match` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[puuid]` on the table `MatchParticipants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameEndTimestamp` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `puuid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summonerId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Champ" DROP CONSTRAINT "Champ_userId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "gameEndTimesstamp",
ADD COLUMN     "gameEndTimestamp" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "lastGame" TIMESTAMP(3),
ADD COLUMN     "puuid" INTEGER NOT NULL,
ADD COLUMN     "summonerId" INTEGER NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipants_puuid_key" ON "MatchParticipants"("puuid");

-- AddForeignKey
ALTER TABLE "Champ" ADD CONSTRAINT "Champ_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;
