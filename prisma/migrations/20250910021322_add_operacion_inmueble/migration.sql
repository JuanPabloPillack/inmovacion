/*
  Warnings:

  - Added the required column `id_operacion` to the `Inmueble` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inmueble` ADD COLUMN `id_operacion` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Operacion` (
    `id_operacion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_operacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_operacion_fkey` FOREIGN KEY (`id_operacion`) REFERENCES `Operacion`(`id_operacion`) ON DELETE RESTRICT ON UPDATE CASCADE;
