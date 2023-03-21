-- CreateEnum
CREATE TYPE "FeatureFlags" AS ENUM ('UNDEFINED', 'DEV', 'BETA');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('UNDEFINED', 'BAN', 'KICK', 'MUTE', 'TIMEOUT', 'UNBAN', 'UNMUTE', 'UNTIMEOUT');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('NONE', 'NEW', 'LIVE', 'UPCOMING', 'PAST', 'MISSING');

-- CreateTable
CREATE TABLE "KaraokeUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partnerId" TEXT,
    "partnerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "KaraokeUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KaraokeEvent" (
    "id" TEXT NOT NULL,
    "textChannelId" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "pinMessageId" TEXT,
    "discordEventId" TEXT,
    "roleId" TEXT,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "KaraokeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSettings" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Mute" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" BIGINT,
    "evadeTime" BIGINT,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Mute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockedChannel" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "duration" BIGINT,
    "oldValue" BOOLEAN,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "LockedChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationCase" (
    "id" UUID NOT NULL,
    "caseId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "userTag" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "moderatorTag" TEXT NOT NULL,
    "type" "ModerationActionType" NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'No reason provided.',
    "duration" BIGINT,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "ModerationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationSettings" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "logChannelId" TEXT,
    "reportChannelId" TEXT,
    "muteRoleId" TEXT,
    "minAccountAgeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minAccountAgeReq" INTEGER,
    "minAccountAgeMsg" TEXT,
    "antiHoistEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ModerationSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "TwitchAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "twitchSubscriptionId" TEXT NOT NULL,

    CONSTRAINT "TwitchAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitchSubscription" (
    "id" UUID NOT NULL,
    "message" TEXT,
    "roleId" TEXT,
    "discordChannelId" TEXT,
    "accountId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "TwitchSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitchSettings" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TwitchSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "time" BIGINT,
    "options" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id","guildId")
);

-- CreateTable
CREATE TABLE "UtilitySettings" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "incidentChannelId" TEXT,
    "creditsChannelId" TEXT,

    CONSTRAINT "UtilitySettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "WelcomeSettings" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "channelId" TEXT,
    "message" TEXT,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "color" TEXT,

    CONSTRAINT "WelcomeSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "YoutubeMessage" (
    "id" TEXT NOT NULL,
    "discordChannelId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "subscriptionId" UUID NOT NULL,

    CONSTRAINT "YoutubeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL,
    "scheduledStartTime" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "channelId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YoutubeVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "YoutubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeSubscription" (
    "id" UUID NOT NULL,
    "message" TEXT,
    "roleId" TEXT,
    "discordChannelId" TEXT,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "YoutubeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeSettings" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "YoutubeSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "CoreSettings" (
    "guildId" TEXT NOT NULL,
    "flags" "FeatureFlags"[],

    CONSTRAINT "CoreSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "IncidentMessage" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DiscordIncident" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL,

    CONSTRAINT "DiscordIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KaraokeUser_id_eventId_key" ON "KaraokeUser"("id", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "KaraokeEvent_id_key" ON "KaraokeEvent"("id");

-- CreateIndex
CREATE UNIQUE INDEX "KaraokeEvent_guildId_key" ON "KaraokeEvent"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "EventSettings_guildId_key" ON "EventSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Mute_userId_guildId_key" ON "Mute"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LockedChannel_id_key" ON "LockedChannel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LockedChannel_guildId_key" ON "LockedChannel"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "ModerationCase_caseId_guildId_key" ON "ModerationCase"("caseId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "ModerationSettings_guildId_key" ON "ModerationSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchAccount_id_key" ON "TwitchAccount"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchSubscription_guildId_key" ON "TwitchSubscription"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchSubscription_guildId_accountId_key" ON "TwitchSubscription"("guildId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchSettings_guildId_key" ON "TwitchSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_id_key" ON "Poll"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UtilitySettings_guildId_key" ON "UtilitySettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "UtilitySettings_incidentChannelId_key" ON "UtilitySettings"("incidentChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "WelcomeSettings_guildId_key" ON "WelcomeSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeMessage_id_key" ON "YoutubeMessage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeMessage_videoId_key" ON "YoutubeMessage"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeMessage_subscriptionId_key" ON "YoutubeMessage"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeVideo_id_key" ON "YoutubeVideo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeChannel_id_key" ON "YoutubeChannel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeSubscription_guildId_key" ON "YoutubeSubscription"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeSubscription_channelId_guildId_key" ON "YoutubeSubscription"("channelId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeSettings_guildId_key" ON "YoutubeSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "CoreSettings_guildId_key" ON "CoreSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentMessage_id_key" ON "IncidentMessage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentMessage_incidentId_key" ON "IncidentMessage"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordIncident_id_key" ON "DiscordIncident"("id");

-- AddForeignKey
ALTER TABLE "KaraokeUser" ADD CONSTRAINT "KaraokeUser_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "KaraokeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KaraokeEvent" ADD CONSTRAINT "KaraokeEvent_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "EventSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSettings" ADD CONSTRAINT "EventSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "CoreSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mute" ADD CONSTRAINT "Mute_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "ModerationSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockedChannel" ADD CONSTRAINT "LockedChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "ModerationSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "ModerationSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationSettings" ADD CONSTRAINT "ModerationSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "CoreSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitchSubscription" ADD CONSTRAINT "TwitchSubscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TwitchAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitchSubscription" ADD CONSTRAINT "TwitchSubscription_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "TwitchSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitchSettings" ADD CONSTRAINT "TwitchSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "CoreSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "UtilitySettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilitySettings" ADD CONSTRAINT "UtilitySettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "CoreSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelcomeSettings" ADD CONSTRAINT "WelcomeSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "CoreSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeMessage" ADD CONSTRAINT "YoutubeMessage_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "YoutubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeMessage" ADD CONSTRAINT "YoutubeMessage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "YoutubeSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeVideo" ADD CONSTRAINT "YoutubeVideo_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "YoutubeChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeSubscription" ADD CONSTRAINT "YoutubeSubscription_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "YoutubeChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeSubscription" ADD CONSTRAINT "YoutubeSubscription_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "YoutubeSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeSettings" ADD CONSTRAINT "YoutubeSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "CoreSettings"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentMessage" ADD CONSTRAINT "IncidentMessage_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "DiscordIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
