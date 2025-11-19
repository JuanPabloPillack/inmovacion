-- CreateTable
CREATE TABLE `EstadoPago` (
    `id_estado_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `EstadoPago_nombre_key`(`nombre`),
    PRIMARY KEY (`id_estado_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedioPago` (
    `id_medio_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `MedioPago_nombre_key`(`nombre`),
    PRIMARY KEY (`id_medio_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PagoProveedor` (
    `id_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_pago` DATETIME(3) NOT NULL,
    `proveedorId` INTEGER NOT NULL,
    `concepto` VARCHAR(255) NOT NULL,
    `importe` DECIMAL(10, 2) NOT NULL,
    `medioPagoId` INTEGER NOT NULL,
    `comprobante` VARCHAR(255) NULL,
    `responsable` VARCHAR(150) NOT NULL,
    `estadoPagoId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_modificacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PagoProveedor` ADD CONSTRAINT `PagoProveedor_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id_proveedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagoProveedor` ADD CONSTRAINT `PagoProveedor_medioPagoId_fkey` FOREIGN KEY (`medioPagoId`) REFERENCES `MedioPago`(`id_medio_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagoProveedor` ADD CONSTRAINT `PagoProveedor_estadoPagoId_fkey` FOREIGN KEY (`estadoPagoId`) REFERENCES `EstadoPago`(`id_estado_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;
