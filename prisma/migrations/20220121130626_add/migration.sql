/*
  Warnings:

  - Added the required column `gameEndTImestamp` to the `MatchParticipants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchParticipants" ADD COLUMN     "gameEndTImestamp" TIMESTAMP(3) NOT NULL;
