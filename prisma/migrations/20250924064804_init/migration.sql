/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `VerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'active',
    MODIFY `email` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `VerificationToken` ADD PRIMARY KEY (`identifier`, `token`);

-- DropIndex
DROP INDEX `VerificationToken_identifier_token_key` ON `VerificationToken`;

-- CreateIndex
CREATE UNIQUE INDEX `VerificationToken_identifier_key` ON `VerificationToken`(`identifier`);
