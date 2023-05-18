/*
  Warnings:

  - You are about to drop the column `logChannelId` on the `ModerationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `muteRoleId` on the `ModerationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `TwitchSubscription` table. All the data in the column will be lost.
  - You are about to drop the `LockedChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModerationCase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TwitchAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YoutubeChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YoutubeMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YoutubeVideo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[guildId,channelId]` on the table `TwitchSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channelId` to the `TwitchSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LockedChannel" DROP CONSTRAINT "LockedChannel_guildId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationCase" DROP CONSTRAINT "ModerationCase_guildId_fkey";

-- DropForeignKey
ALTER TABLE "Mute" DROP CONSTRAINT "Mute_guildId_fkey";

-- DropForeignKey
ALTER TABLE "TwitchSubscription" DROP CONSTRAINT "TwitchSubscription_accountId_fkey";

-- DropForeignKey
ALTER TABLE "YoutubeMessage" DROP CONSTRAINT "YoutubeMessage_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "YoutubeMessage" DROP CONSTRAINT "YoutubeMessage_videoId_fkey";

-- DropForeignKey
ALTER TABLE "YoutubeSubscription" DROP CONSTRAINT "YoutubeSubscription_channelId_fkey";

-- DropForeignKey
ALTER TABLE "YoutubeVideo" DROP CONSTRAINT "YoutubeVideo_channelId_fkey";

-- DropIndex
DROP INDEX "TwitchSubscription_guildId_accountId_key";

-- DropIndex
DROP INDEX "YoutubeSubscription_guildId_key";

-- AlterTable
ALTER TABLE "ModerationSettings" DROP COLUMN "logChannelId",
DROP COLUMN "muteRoleId";

-- AlterTable
ALTER TABLE "TwitchSubscription" DROP COLUMN "accountId",
ADD COLUMN     "channelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "YoutubeSubscription" ADD COLUMN     "memberDiscordChannelId" TEXT,
ADD COLUMN     "memberRoleId" TEXT;

-- DropTable
DROP TABLE "LockedChannel";

-- DropTable
DROP TABLE "ModerationCase";

-- DropTable
DROP TABLE "Mute";

-- DropTable
DROP TABLE "TwitchAccount";

-- DropTable
DROP TABLE "YoutubeChannel";

-- DropTable
DROP TABLE "YoutubeMessage";

-- DropTable
DROP TABLE "YoutubeVideo";

-- DropEnum
DROP TYPE "VideoStatus";

-- CreateTable
CREATE TABLE "HolodexChannel" (
    "youtubeId" TEXT NOT NULL,
    "twitchId" TEXT,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "image" TEXT,
    "twitchSubscriptionId" TEXT,

    CONSTRAINT "HolodexChannel_pkey" PRIMARY KEY ("youtubeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "HolodexChannel_youtubeId_key" ON "HolodexChannel"("youtubeId");

-- CreateIndex
CREATE UNIQUE INDEX "HolodexChannel_twitchId_key" ON "HolodexChannel"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchSubscription_guildId_channelId_key" ON "TwitchSubscription"("guildId", "channelId");

-- AddForeignKey
ALTER TABLE "YoutubeSubscription" ADD CONSTRAINT "YoutubeSubscription_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "HolodexChannel"("youtubeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitchSubscription" ADD CONSTRAINT "TwitchSubscription_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "HolodexChannel"("twitchId") ON DELETE CASCADE ON UPDATE CASCADE;
