/*
  Warnings:

  - Added the required column `titulo` to the `Inmueble` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inmueble` ADD COLUMN `titulo` VARCHAR(200) NOT NULL DEFAULT 'Sin título';

