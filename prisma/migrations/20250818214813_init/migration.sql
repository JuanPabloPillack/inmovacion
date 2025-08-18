-- CreateTable
CREATE TABLE `Cliente` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `apellido` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `documento` VARCHAR(50) NOT NULL,
    `correo_electronico` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `descripcion` VARCHAR(200) NULL,

    UNIQUE INDEX `Cliente_correo_electronico_key`(`correo_electronico`),
    INDEX `idx_cliente_nombre`(`nombre`, `apellido`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tipo_cliente` (
    `id_tipo_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_tipo_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medio_pago` (
    `id_medio_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_medio_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Provincia` (
    `id_provincia` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_provincia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tipo_inmueble` (
    `id_tipo_inmueble` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_tipo_inmueble`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estado` (
    `id_estado` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_estado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estado_rendicion` (
    `id_estado_rendicion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_estado_rendicion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proveedor` (
    `id_proveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `apellido` VARCHAR(50) NOT NULL,
    `razon_social` VARCHAR(150) NOT NULL,
    `correo_electronico` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `Proveedor_correo_electronico_key`(`correo_electronico`),
    PRIMARY KEY (`id_proveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente_Tipo_cliente` (
    `id_cliente` INTEGER NOT NULL,
    `id_tipo_cliente` INTEGER NOT NULL,

    PRIMARY KEY (`id_cliente`, `id_tipo_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_rol` INTEGER NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `correo_electronico` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `fecha_registro` DATE NOT NULL,

    UNIQUE INDEX `Usuario_correo_electronico_key`(`correo_electronico`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Localidad` (
    `id_localidad` INTEGER NOT NULL AUTO_INCREMENT,
    `id_provincia` INTEGER NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_localidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barrio` (
    `id_barrio` INTEGER NOT NULL AUTO_INCREMENT,
    `id_localidad` INTEGER NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_barrio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ubicacion` (
    `id_ubicacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_barrio` INTEGER NOT NULL,
    `nombre_calle` VARCHAR(100) NOT NULL,
    `numero` INTEGER NOT NULL,

    PRIMARY KEY (`id_ubicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inmueble` (
    `id_inmueble` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tipo_inmueble` INTEGER NOT NULL,
    `id_ubicacion` INTEGER NOT NULL,
    `id_estado` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `superficie_total` DECIMAL(10, 2) NOT NULL,
    `superficie_cubierta` DECIMAL(10, 2) NULL,
    `cantidad_ambientes` INTEGER NULL,
    `antiguedad` INTEGER NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `foto` VARCHAR(200) NOT NULL,
    `detalles` VARCHAR(255) NULL,

    PRIMARY KEY (`id_inmueble`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id_contrato` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_inmueble` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `archivo` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`id_contrato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cobranza` (
    `id_cobranza` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_inmueble` INTEGER NOT NULL,
    `id_medio_pago` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,

    INDEX `idx_cobranza_fecha`(`fecha`),
    PRIMARY KEY (`id_cobranza`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rendicion` (
    `id_rendicion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_inmueble` INTEGER NOT NULL,
    `id_estado_rendicion` INTEGER NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_final` DATE NOT NULL,
    `fecha_generacion` DATE NOT NULL,
    `monto_total` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_rendicion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rendicion_Cobranza` (
    `id_rendicion` INTEGER NOT NULL,
    `id_cobranza` INTEGER NOT NULL,

    PRIMARY KEY (`id_rendicion`, `id_cobranza`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `id_proveedor` INTEGER NOT NULL,
    `id_medio_pago` INTEGER NOT NULL,
    `id_inmueble` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Historial` (
    `id_historial` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `tabla` VARCHAR(50) NOT NULL,
    `id_registro` INTEGER NOT NULL,
    `fecha_hora` DATETIME(3) NOT NULL,
    `campo_modificado` VARCHAR(255) NOT NULL,
    `valor_antiguo` TEXT NULL,
    `valor_nuevo` TEXT NULL,

    INDEX `idx_historial_tabla`(`tabla`, `id_registro`),
    PRIMARY KEY (`id_historial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cliente_Tipo_cliente` ADD CONSTRAINT `Cliente_Tipo_cliente_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente_Tipo_cliente` ADD CONSTRAINT `Cliente_Tipo_cliente_id_tipo_cliente_fkey` FOREIGN KEY (`id_tipo_cliente`) REFERENCES `Tipo_cliente`(`id_tipo_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_id_rol_fkey` FOREIGN KEY (`id_rol`) REFERENCES `Rol`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Localidad` ADD CONSTRAINT `Localidad_id_provincia_fkey` FOREIGN KEY (`id_provincia`) REFERENCES `Provincia`(`id_provincia`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_medio_pago_fkey` FOREIGN KEY (`id_medio_pago`) REFERENCES `Medio_pago`(`id_medio_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranza` ADD CONSTRAINT `Cobranza_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rendicion` ADD CONSTRAINT `Rendicion_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rendicion` ADD CONSTRAINT `Rendicion_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rendicion` ADD CONSTRAINT `Rendicion_id_estado_rendicion_fkey` FOREIGN KEY (`id_estado_rendicion`) REFERENCES `Estado_rendicion`(`id_estado_rendicion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rendicion_Cobranza` ADD CONSTRAINT `Rendicion_Cobranza_id_rendicion_fkey` FOREIGN KEY (`id_rendicion`) REFERENCES `Rendicion`(`id_rendicion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rendicion_Cobranza` ADD CONSTRAINT `Rendicion_Cobranza_id_cobranza_fkey` FOREIGN KEY (`id_cobranza`) REFERENCES `Cobranza`(`id_cobranza`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_proveedor_fkey` FOREIGN KEY (`id_proveedor`) REFERENCES `Proveedor`(`id_proveedor`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_medio_pago_fkey` FOREIGN KEY (`id_medio_pago`) REFERENCES `Medio_pago`(`id_medio_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_inmueble_fkey` FOREIGN KEY (`id_inmueble`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `fk_historial_cliente` FOREIGN KEY (`id_registro`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `fk_historial_inmueble` FOREIGN KEY (`id_registro`) REFERENCES `Inmueble`(`id_inmueble`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `fk_historial_cobranza` FOREIGN KEY (`id_registro`) REFERENCES `Cobranza`(`id_cobranza`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `fk_historial_rendicion` FOREIGN KEY (`id_registro`) REFERENCES `Rendicion`(`id_rendicion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial` ADD CONSTRAINT `fk_historial_pago` FOREIGN KEY (`id_registro`) REFERENCES `Pago`(`id_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;
