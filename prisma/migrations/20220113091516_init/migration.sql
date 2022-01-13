-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "summonerName" TEXT NOT NULL,
    "totalWin" INTEGER NOT NULL,
    "totalLose" INTEGER NOT NULL,
    "rank" TEXT NOT NULL,
    "tier" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Champ" (
    "id" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "win" INTEGER NOT NULL,
    "lose" INTEGER NOT NULL,
    "kill" INTEGER NOT NULL,
    "death" INTEGER NOT NULL,
    "assist" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Champ_userId_key" ON "Champ"("userId");

-- AddForeignKey
ALTER TABLE "Champ" ADD CONSTRAINT "Champ_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
