/*
  Warnings:

  - You are about to drop the column `apellido` on the `Cliente` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `VarChar(100)`.
  - You are about to drop the column `id_contrato` on the `Cobranza` table. All the data in the column will be lost.
  - You are about to drop the column `id_contrato` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `id_contrato` on the `Pago` table. All the data in the column will be lost.
  - You are about to drop the column `id_barrio` on the `Ubicacion` table. All the data in the column will be lost.
  - You are about to alter the column `direccion` on the `Ubicacion` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(200)`.
  - You are about to drop the `Barrio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Localidad` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `monto` to the `Contrato` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Barrio` DROP FOREIGN KEY `Barrio_id_localidad_fkey`;

-- DropForeignKey
ALTER TABLE `Cobranza` DROP FOREIGN KEY `Cobranza_id_contrato_fkey`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `Historial_id_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `Historial_id_contrato_fkey`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `Historial_id_inmueble_fkey`;

-- DropForeignKey
ALTER TABLE `Pago` DROP FOREIGN KEY `Pago_id_contrato_fkey`;

-- DropForeignKey
ALTER TABLE `Ubicacion` DROP FOREIGN KEY `Ubicacion_id_barrio_fkey`;

-- DropIndex
DROP INDEX `Cobranza_id_contrato_fkey` ON `Cobranza`;

-- DropIndex
DROP INDEX `Historial_id_cliente_fkey` ON `Historial`;

-- DropIndex
DROP INDEX `Historial_id_contrato_fkey` ON `Historial`;

-- DropIndex
DROP INDEX `Historial_id_inmueble_fkey` ON `Historial`;

-- DropIndex
DROP INDEX `Pago_id_contrato_fkey` ON `Pago`;

-- DropIndex
DROP INDEX `Ubicacion_id_barrio_fkey` ON `Ubicacion`;

-- AlterTable
ALTER TABLE `Cliente` DROP COLUMN `apellido`,
    MODIFY `telefono` VARCHAR(50) NULL,
    MODIFY `email` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `Cobranza` DROP COLUMN `id_contrato`;

-- AlterTable
ALTER TABLE `Contrato` ADD COLUMN `monto` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Estado` MODIFY `nombre` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `Historial` DROP COLUMN `id_contrato`,
    MODIFY `id_cliente` INTEGER NULL,
    MODIFY `id_inmueble` INTEGER NULL;

-- AlterTable
ALTER TABLE `Inmueble` MODIFY `foto` VARCHAR(200) NULL;

-- AlterTable
ALTER TABLE `InmuebleImagen` ADD COLUMN `principal` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Pago` DROP COLUMN `id_contrato`;

-- AlterTable
ALTER TABLE `Tipo_inmueble` MODIFY `nombre` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `Ubicacion` DROP COLUMN `id_barrio`,
    ADD COLUMN `ciudad` VARCHAR(100) NULL,
    ADD COLUMN `provincia` VARCHAR(100) NULL,
    MODIFY `direccion` VARCHAR(200) NOT NULL;

-- DropTable
DROP TABLE `Barrio`;

-- DropTable
DROP TABLE `Localidad`;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE;
