-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'admin',
    `phone` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `refresh_token_expires_in` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Account_userId_key`(`userId`),
    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_identifier_key`(`identifier`),
    PRIMARY KEY (`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoCliente` (
    `id_tipo_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_tipo_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `telefono` VARCHAR(50) NULL,
    `tipoClienteId` INTEGER NULL,

    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tipo_inmueble` (
    `id_tipo_inmueble` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_tipo_inmueble`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `Ubicacion` (
    `id_ubicacion` INTEGER NOT NULL AUTO_INCREMENT,
    `direccion` VARCHAR(200) NOT NULL,
    `ciudad` VARCHAR(100) NULL,
    `provincia` VARCHAR(100) NULL,
    `id_barrio` INTEGER NULL,

    PRIMARY KEY (`id_ubicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estado` (
    `id_estado` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_estado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Operacion` (
    `id_operacion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_operacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inmueble` (
    `id_inmueble` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tipo_inmueble` INTEGER NOT NULL,
    `id_ubicacion` INTEGER NOT NULL,
    `id_estado` INTEGER NOT NULL,
    `id_operacion` INTEGER NULL,
    `id_cliente` INTEGER NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `superficie_total` DECIMAL(10, 2) NOT NULL,
    `superficie_cubierta` DECIMAL(10, 2) NULL,
    `cantidad_ambientes` INTEGER NULL,
    `cantidad_banos` INTEGER NULL,
    `cantidad_dormitorios` INTEGER NULL,
    `cantidad_cocheras` INTEGER NULL,
    `cantidad_pisos` INTEGER NULL,
    `antiguedad` INTEGER NULL,
    `precio` DECIMAL(10, 2) NULL,
    `foto` VARCHAR(200) NULL,
    `detalles` VARCHAR(255) NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_inmueble`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InmuebleImagen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `principal` BOOLEAN NOT NULL DEFAULT false,
    `inmuebleId` INTEGER NOT NULL,

    INDEX `idx_inmueble_imagen_inmuebleId`(`inmuebleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `archivoPath` VARCHAR(255) NOT NULL,
    `camposVariables` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id_contrato` INTEGER NOT NULL AUTO_INCREMENT,
    `id_inmueble` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `id_template` INTEGER NULL,
    `nombre` VARCHAR(100) NULL,
    `valores` JSON NULL,
    `archivoPath` VARCHAR(255) NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_fin` DATETIME(3) NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_contrato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cobranza` (
    `id_cobranza` INTEGER NOT NULL AUTO_INCREMENT,
    `id_inmueble` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_cobranza`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rendicion` (
    `id_rendicion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_inmueble` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `monto_total` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_rendicion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `id_inmueble` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Historial` (
    `id_historial` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(255) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `id_inmueble` INTEGER NULL,
    `id_cliente` INTEGER NULL,

    PRIMARY KEY (`id_historial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoServicio` (
    `id_tipo_servicio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `TipoServicio_nombre_key`(`nombre`),
    PRIMARY KEY (`id_tipo_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proveedor` (
    `id_proveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_razon_social` VARCHAR(150) NOT NULL,
    `cuit_cuil` VARCHAR(20) NOT NULL,
    `correo_contacto` VARCHAR(100) NULL,
    `telefono_contacto` VARCHAR(50) NULL,
    `direccion` VARCHAR(200) NULL,
    `tipoServicioId` INTEGER NOT NULL,
    `datos_bancarios` TEXT NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,
    `observaciones` VARCHAR(255) NULL,
    `fecha_alta` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Proveedor_cuit_cuil_key`(`cuit_cuil`),
    PRIMARY KEY (`id_proveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_tipoClienteId_fkey` FOREIGN KEY (`tipoClienteId`) REFERENCES `TipoCliente`(`id_tipo_cliente`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barrio` ADD CONSTRAINT `Barrio_id_localidad_fkey` FOREIGN KEY (`id_localidad`) REFERENCES `Localidad`(`id_localidad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ubicacion` ADD CONSTRAINT `Ubicacion_id_barrio_fkey` FOREIGN KEY (`id_barrio`) REFERENCES `Barrio`(`id_barrio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_tipo_inmueble_fkey` FOREIGN KEY (`id_tipo_inmueble`) REFERENCES `Tipo_inmueble`(`id_tipo_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_ubicacion_fkey` FOREIGN KEY (`id_ubicacion`) REFERENCES `Ubicacion`(`id_ubicacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_estado_fkey` FOREIGN KEY (`id_estado`) REFERENCES `Estado`(`id_estado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_operacion_fkey` FOREIGN KEY (`id_operacion`) REFERENCES `Operacion`(`id_operacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InmuebleImagen` ADD CONSTRAINT `InmuebleImagen_inmuebleId_fkey` FOREIGN KEY (`inmuebleId`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_template_fkey` FOREIGN KEY (`id_template`) REFERENCES `Template`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rendicion` ADD CONSTRAINT `Rendicion_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proveedor` ADD CONSTRAINT `Proveedor_tipoServicioId_fkey` FOREIGN KEY (`tipoServicioId`) REFERENCES `TipoServicio`(`id_tipo_servicio`) ON DELETE RESTRICT ON UPDATE CASCADE;
