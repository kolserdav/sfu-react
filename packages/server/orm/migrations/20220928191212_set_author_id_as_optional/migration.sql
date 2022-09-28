-- DropForeignKey
ALTER TABLE `Room` DROP FOREIGN KEY `Room_authorId_fkey`;

-- AlterTable
ALTER TABLE `Room` MODIFY `authorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
