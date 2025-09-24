/*
  Warnings:

  - You are about to drop the column `name` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Client` DROP COLUMN `name`,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT 'SinNombre',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT 'SinApellido';
