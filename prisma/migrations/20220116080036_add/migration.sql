/*
  Warnings:

  - A unique constraint covering the columns `[summonerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_summonerId_key" ON "User"("summonerId");
