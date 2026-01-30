-- Alter EmailLogs table to support longer text fields
ALTER TABLE `EmailLogs` MODIFY COLUMN `errorMessage` TEXT;
ALTER TABLE `EmailLogs` MODIFY COLUMN `emailSubject` VARCHAR(500);
ALTER TABLE `EmailLogs` MODIFY COLUMN `emailBody` TEXT;
ALTER TABLE `EmailLogs` MODIFY COLUMN `openedFromUserAgent` TEXT;
ALTER TABLE `EmailLogs` MODIFY COLUMN `clickedFromUserAgent` TEXT;
