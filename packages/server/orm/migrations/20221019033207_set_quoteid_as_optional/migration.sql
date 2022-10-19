-- DropForeignKey
ALTER TABLE `Quote` DROP FOREIGN KEY `Quote_quoteId_fkey`;

-- AlterTable
ALTER TABLE `Quote` MODIFY `quoteId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
