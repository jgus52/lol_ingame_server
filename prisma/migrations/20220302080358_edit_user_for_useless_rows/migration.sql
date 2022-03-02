/*
  Warnings:

  - You are about to drop the column `rank` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalLose` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalWin` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "rank",
DROP COLUMN "tier",
DROP COLUMN "totalLose",
DROP COLUMN "totalWin";
