/*
  Warnings:

  - The primary key for the `Champ` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Champ" DROP CONSTRAINT "Champ_userId_fkey";

-- AlterTable
ALTER TABLE "Champ" DROP CONSTRAINT "Champ_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Champ_pkey" PRIMARY KEY ("id", "userId");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "puuid" SET DATA TYPE TEXT,
ALTER COLUMN "summonerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("puuid");

-- AddForeignKey
ALTER TABLE "Champ" ADD CONSTRAINT "Champ_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;
