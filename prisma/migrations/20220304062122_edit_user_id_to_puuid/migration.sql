/*
  Warnings:

  - The primary key for the `Champ` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Champ` table. All the data in the column will be lost.
  - Added the required column `puuid` to the `Champ` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Champ" DROP CONSTRAINT "Champ_userId_fkey";

-- AlterTable
ALTER TABLE "Champ" DROP CONSTRAINT "Champ_pkey",
DROP COLUMN "userId",
ADD COLUMN     "puuid" TEXT NOT NULL,
ADD CONSTRAINT "Champ_pkey" PRIMARY KEY ("id", "puuid");

-- AddForeignKey
ALTER TABLE "Champ" ADD CONSTRAINT "Champ_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "User"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;
