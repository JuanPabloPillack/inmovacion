-- AlterTable
ALTER TABLE `Ubicacion` ADD COLUMN `id_barrio` INTEGER NULL;

-- CreateTable
CREATE TABLE `Localidad` (
    `id_localidad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_localidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barrio` (
    `id_barrio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `id_localidad` INTEGER NOT NULL,

    PRIMARY KEY (`id_barrio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Barrio` ADD CONSTRAINT `Barrio_id_localidad_fkey` FOREIGN KEY (`id_localidad`) REFERENCES `Localidad`(`id_localidad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ubicacion` ADD CONSTRAINT `Ubicacion_id_barrio_fkey` FOREIGN KEY (`id_barrio`) REFERENCES `Barrio`(`id_barrio`) ON DELETE RESTRICT ON UPDATE CASCADE;
