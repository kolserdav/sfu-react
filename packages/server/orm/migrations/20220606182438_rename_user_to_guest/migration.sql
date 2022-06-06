/*
  Warnings:

  - Added the required column `guestId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `guestId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Guest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `lastVisit` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `Guest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
