/*
  Warnings:

  - You are about to alter the column `name` on the `Unit` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `Unit` MODIFY `name` VARCHAR(50) NOT NULL DEFAULT 'No Name';
