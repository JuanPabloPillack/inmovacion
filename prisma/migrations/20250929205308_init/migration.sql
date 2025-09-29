-- DropForeignKey
ALTER TABLE `inmueble` DROP FOREIGN KEY `Inmueble_id_operacion_fkey`;

-- DropIndex
DROP INDEX `Inmueble_id_operacion_fkey` ON `inmueble`;

-- AlterTable
ALTER TABLE `inmueble` MODIFY `id_operacion` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_operacion_fkey` FOREIGN KEY (`id_operacion`) REFERENCES `Operacion`(`id_operacion`) ON DELETE SET NULL ON UPDATE CASCADE;
