/*
  Warnings:

  - You are about to drop the column `correo_electronico` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `documento` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Cobranza` table. All the data in the column will be lost.
  - You are about to drop the column `id_medio_pago` on the `Cobranza` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `Cobranza` table. All the data in the column will be lost.
  - You are about to drop the column `archivo` on the `Contrato` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `Contrato` table. All the data in the column will be lost.
  - You are about to drop the column `campo_modificado` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `id_registro` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `tabla` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `valor_antiguo` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `valor_nuevo` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `id_provincia` on the `Localidad` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Pago` table. All the data in the column will be lost.
  - You are about to drop the column `id_medio_pago` on the `Pago` table. All the data in the column will be lost.
  - You are about to drop the column `id_proveedor` on the `Pago` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `Pago` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_final` on the `Rendicion` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_generacion` on the `Rendicion` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `Rendicion` table. All the data in the column will be lost.
  - You are about to drop the column `id_cliente` on the `Rendicion` table. All the data in the column will be lost.
  - You are about to drop the column `id_estado_rendicion` on the `Rendicion` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_calle` on the `Ubicacion` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `Ubicacion` table. All the data in the column will be lost.
  - You are about to drop the `Cliente_Tipo_cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Estado_rendicion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medio_pago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proveedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Provincia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rendicion_Cobranza` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tipo_cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_contrato` to the `Cobranza` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_fin` to the `Contrato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_inicio` to the `Contrato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descripcion` to the `Historial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha` to the `Historial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `Historial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_inmueble` to the `Historial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `Pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_contrato` to the `Pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha` to the `Rendicion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Cliente_Tipo_cliente` DROP FOREIGN KEY `Cliente_Tipo_cliente_id_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `Cliente_Tipo_cliente` DROP FOREIGN KEY `Cliente_Tipo_cliente_id_tipo_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `Cobranza` DROP FOREIGN KEY `Cobranza_id_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `Cobranza` DROP FOREIGN KEY `Cobranza_id_inmueble_fkey`;

-- DropForeignKey
ALTER TABLE `Cobranza` DROP FOREIGN KEY `Cobranza_id_medio_pago_fkey`;

-- DropForeignKey
ALTER TABLE `Cobranza` DROP FOREIGN KEY `Cobranza_id_usuario_fkey`;

-- DropForeignKey
ALTER TABLE `Contrato` DROP FOREIGN KEY `Contrato_id_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `Contrato` DROP FOREIGN KEY `Contrato_id_inmueble_fkey`;

-- DropForeignKey
ALTER TABLE `Contrato` DROP FOREIGN KEY `Contrato_id_usuario_fkey`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `fk_historial_cliente`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `fk_historial_cobranza`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `fk_historial_inmueble`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `fk_historial_pago`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `fk_historial_rendicion`;

-- DropForeignKey
ALTER TABLE `Historial` DROP FOREIGN KEY `fk_historial_usuario`;

-- DropForeignKey
ALTER TABLE `Localidad` DROP FOREIGN KEY `Localidad_id_provincia_fkey`;

-- DropForeignKey
ALTER TABLE `Pago` DROP FOREIGN KEY `Pago_id_inmueble_fkey`;

-- DropForeignKey
ALTER TABLE `Pago` DROP FOREIGN KEY `Pago_id_medio_pago_fkey`;

-- DropForeignKey
ALTER TABLE `Pago` DROP FOREIGN KEY `Pago_id_proveedor_fkey`;

-- DropForeignKey
ALTER TABLE `Pago` DROP FOREIGN KEY `Pago_id_usuario_fkey`;

-- DropForeignKey
ALTER TABLE `Rendicion` DROP FOREIGN KEY `Rendicion_id_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `Rendicion` DROP FOREIGN KEY `Rendicion_id_estado_rendicion_fkey`;

-- DropForeignKey
ALTER TABLE `Rendicion` DROP FOREIGN KEY `Rendicion_id_inmueble_fkey`;

-- DropForeignKey
ALTER TABLE `Rendicion_Cobranza` DROP FOREIGN KEY `Rendicion_Cobranza_id_cobranza_fkey`;

-- DropForeignKey
ALTER TABLE `Rendicion_Cobranza` DROP FOREIGN KEY `Rendicion_Cobranza_id_rendicion_fkey`;

-- DropForeignKey
ALTER TABLE `Usuario` DROP FOREIGN KEY `Usuario_id_rol_fkey`;

-- DropIndex
DROP INDEX `Cliente_correo_electronico_key` ON `Cliente`;

-- DropIndex
DROP INDEX `idx_cliente_nombre` ON `Cliente`;

-- DropIndex
DROP INDEX `Cobranza_id_cliente_fkey` ON `Cobranza`;

-- DropIndex
DROP INDEX `Cobranza_id_inmueble_fkey` ON `Cobranza`;

-- DropIndex
DROP INDEX `Cobranza_id_medio_pago_fkey` ON `Cobranza`;

-- DropIndex
DROP INDEX `Cobranza_id_usuario_fkey` ON `Cobranza`;

-- DropIndex
DROP INDEX `idx_cobranza_fecha` ON `Cobranza`;

-- DropIndex
DROP INDEX `Contrato_id_cliente_fkey` ON `Contrato`;

-- DropIndex
DROP INDEX `Contrato_id_inmueble_fkey` ON `Contrato`;

-- DropIndex
DROP INDEX `Contrato_id_usuario_fkey` ON `Contrato`;

-- DropIndex
DROP INDEX `fk_historial_pago` ON `Historial`;

-- DropIndex
DROP INDEX `fk_historial_usuario` ON `Historial`;

-- DropIndex
DROP INDEX `idx_historial_tabla` ON `Historial`;

-- DropIndex
DROP INDEX `Localidad_id_provincia_fkey` ON `Localidad`;

-- DropIndex
DROP INDEX `Pago_id_inmueble_fkey` ON `Pago`;

-- DropIndex
DROP INDEX `Pago_id_medio_pago_fkey` ON `Pago`;

-- DropIndex
DROP INDEX `Pago_id_proveedor_fkey` ON `Pago`;

-- DropIndex
DROP INDEX `Pago_id_usuario_fkey` ON `Pago`;

-- DropIndex
DROP INDEX `Rendicion_id_cliente_fkey` ON `Rendicion`;

-- DropIndex
DROP INDEX `Rendicion_id_estado_rendicion_fkey` ON `Rendicion`;

-- DropIndex
DROP INDEX `Rendicion_id_inmueble_fkey` ON `Rendicion`;

-- AlterTable
ALTER TABLE `Barrio` MODIFY `nombre` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `Cliente` DROP COLUMN `correo_electronico`,
    DROP COLUMN `descripcion`,
    DROP COLUMN `documento`,
    ADD COLUMN `email` VARCHAR(150) NULL,
    MODIFY `apellido` VARCHAR(100) NOT NULL,
    MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `telefono` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `Cobranza` DROP COLUMN `descripcion`,
    DROP COLUMN `id_medio_pago`,
    DROP COLUMN `id_usuario`,
    ADD COLUMN `id_contrato` INTEGER NOT NULL,
    MODIFY `fecha` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Contrato` DROP COLUMN `archivo`,
    DROP COLUMN `id_usuario`,
    ADD COLUMN `fecha_fin` DATETIME(3) NOT NULL,
    ADD COLUMN `fecha_inicio` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Historial` DROP COLUMN `campo_modificado`,
    DROP COLUMN `fecha_hora`,
    DROP COLUMN `id_registro`,
    DROP COLUMN `id_usuario`,
    DROP COLUMN `tabla`,
    DROP COLUMN `valor_antiguo`,
    DROP COLUMN `valor_nuevo`,
    ADD COLUMN `descripcion` VARCHAR(255) NOT NULL,
    ADD COLUMN `fecha` DATETIME(3) NOT NULL,
    ADD COLUMN `id_cliente` INTEGER NOT NULL,
    ADD COLUMN `id_contrato` INTEGER NULL,
    ADD COLUMN `id_inmueble` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Localidad` DROP COLUMN `id_provincia`,
    MODIFY `nombre` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `Pago` DROP COLUMN `descripcion`,
    DROP COLUMN `id_medio_pago`,
    DROP COLUMN `id_proveedor`,
    DROP COLUMN `id_usuario`,
    ADD COLUMN `id_cliente` INTEGER NOT NULL,
    ADD COLUMN `id_contrato` INTEGER NOT NULL,
    MODIFY `fecha` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Rendicion` DROP COLUMN `fecha_final`,
    DROP COLUMN `fecha_generacion`,
    DROP COLUMN `fecha_inicio`,
    DROP COLUMN `id_cliente`,
    DROP COLUMN `id_estado_rendicion`,
    ADD COLUMN `fecha` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Ubicacion` DROP COLUMN `nombre_calle`,
    DROP COLUMN `numero`,
    ADD COLUMN `direccion` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `Cliente_Tipo_cliente`;

-- DropTable
DROP TABLE `Estado_rendicion`;

-- DropTable
DROP TABLE `Medio_pago`;

-- DropTable
DROP TABLE `Proveedor`;

-- DropTable
DROP TABLE `Provincia`;

-- DropTable
DROP TABLE `Rendicion_Cobranza`;

-- DropTable
DROP TABLE `Rol`;

-- DropTable
DROP TABLE `Tipo_cliente`;

-- DropTable
DROP TABLE `Usuario`;

-- CreateTable
CREATE TABLE `InmuebleImagen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `inmuebleId` INTEGER NOT NULL,

    INDEX `idx_inmueble_imagen_inmuebleId`(`inmuebleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_contrato_fkey` FOREIGN KEY (`id_contrato`) REFERENCES `Contrato`(`id_contrato`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rendicion` ADD CONSTRAINT `Rendicion_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_contrato_fkey` FOREIGN KEY (`id_contrato`) REFERENCES `Contrato`(`id_contrato`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_id_contrato_fkey` FOREIGN KEY (`id_contrato`) REFERENCES `Contrato`(`id_contrato`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InmuebleImagen` ADD CONSTRAINT `InmuebleImagen_inmuebleId_fkey` FOREIGN KEY (`inmuebleId`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE CASCADE ON UPDATE CASCADE;
