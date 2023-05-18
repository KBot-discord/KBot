-- CreateTable
CREATE TABLE "Blacklist" (
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "TwitchConflict" (
    "channelId" TEXT NOT NULL,

    CONSTRAINT "TwitchConflict_pkey" PRIMARY KEY ("channelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blacklist_guildId_key" ON "Blacklist"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchConflict_channelId_key" ON "TwitchConflict"("channelId");
