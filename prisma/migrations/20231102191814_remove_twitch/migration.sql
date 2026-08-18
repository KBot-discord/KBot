/*
  Warnings:

  - You are about to drop the column `twitchId` on the `HolodexChannel` table. All the data in the column will be lost.
  - You are about to drop the column `twitchSubscriptionId` on the `HolodexChannel` table. All the data in the column will be lost.
  - You are about to drop the `TwitchConflict` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "HolodexChannel_twitchId_key";

-- AlterTable
ALTER TABLE "HolodexChannel" DROP COLUMN "twitchId",
DROP COLUMN "twitchSubscriptionId";

-- DropTable
DROP TABLE "TwitchConflict";

-- DropEnum
DROP TYPE "ModerationActionType";
