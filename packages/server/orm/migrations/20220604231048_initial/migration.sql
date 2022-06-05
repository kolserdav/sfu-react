-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('guest', 'user', 'admin') NOT NULL DEFAULT 'guest',
    `userAgent` VARCHAR(100) NULL,
    `ip` VARCHAR(50) NULL,
    `updated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
