/*
  Warnings:

  - You are about to drop the `TwitchSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TwitchSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TwitchSettings" DROP CONSTRAINT "TwitchSettings_guildId_fkey";

-- DropForeignKey
ALTER TABLE "TwitchSubscription" DROP CONSTRAINT "TwitchSubscription_channelId_fkey";

-- DropForeignKey
ALTER TABLE "TwitchSubscription" DROP CONSTRAINT "TwitchSubscription_guildId_fkey";

-- DropTable
DROP TABLE "TwitchSettings";

-- DropTable
DROP TABLE "TwitchSubscription";
