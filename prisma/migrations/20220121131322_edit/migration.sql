/*
  Warnings:

  - You are about to drop the column `gameEndTImestamp` on the `MatchParticipants` table. All the data in the column will be lost.
  - Added the required column `gameEndTimestamp` to the `MatchParticipants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchParticipants" DROP COLUMN "gameEndTImestamp",
ADD COLUMN     "gameEndTimestamp" TIMESTAMP(3) NOT NULL;
