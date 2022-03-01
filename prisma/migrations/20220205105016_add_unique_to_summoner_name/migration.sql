/*
  Warnings:

  - A unique constraint covering the columns `[summonerName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_summonerName_key" ON "User"("summonerName");
