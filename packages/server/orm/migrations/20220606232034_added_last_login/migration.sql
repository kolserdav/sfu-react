/*
  Warnings:

  - You are about to drop the column `LoginTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Guest` ADD COLUMN `lastLogin` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `LoginTime`,
    DROP COLUMN `lastLogin`;
