-- CreateTable
CREATE TABLE `Applicants` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `job_title` VARCHAR(191) NULL,
    `unsubscribed` BOOLEAN NOT NULL DEFAULT false,
    `unsubscribedAt` DATETIME(3) NULL,
    `unsubscribedFromEmail` VARCHAR(191) NULL,

    UNIQUE INDEX `Applicants_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailLogs` (
    `id` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NOT NULL,
    `templateName` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `errorMessage` VARCHAR(191) NULL,
    `emailSubject` VARCHAR(191) NOT NULL,
    `emailBody` VARCHAR(191) NOT NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `openedAt` DATETIME(3) NULL,
    `openCount` INTEGER NOT NULL DEFAULT 0,
    `lastOpenedAt` DATETIME(3) NULL,
    `openedFromIp` VARCHAR(191) NULL,
    `openedFromUserAgent` VARCHAR(191) NULL,
    `clickedAt` DATETIME(3) NULL,
    `clickCount` INTEGER NOT NULL DEFAULT 0,
    `lastClickedAt` DATETIME(3) NULL,
    `clickedUrl` VARCHAR(191) NULL,
    `clickedFromIp` VARCHAR(191) NULL,
    `clickedFromUserAgent` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmailLogs` ADD CONSTRAINT `EmailLogs_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `Applicants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
