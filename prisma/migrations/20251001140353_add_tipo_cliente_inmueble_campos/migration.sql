-- AlterTable
ALTER TABLE `cliente` ADD COLUMN `tipoClienteId` INTEGER NULL;

-- AlterTable
ALTER TABLE `inmueble` ADD COLUMN `cantidad_banos` INTEGER NULL,
    ADD COLUMN `cantidad_cocheras` INTEGER NULL,
    ADD COLUMN `cantidad_dormitorios` INTEGER NULL,
    ADD COLUMN `cantidad_pisos` INTEGER NULL;

-- CreateTable
CREATE TABLE `TipoCliente` (
    `id_tipo_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_tipo_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_tipoClienteId_fkey` FOREIGN KEY (`tipoClienteId`) REFERENCES `TipoCliente`(`id_tipo_cliente`) ON DELETE SET NULL ON UPDATE CASCADE;
