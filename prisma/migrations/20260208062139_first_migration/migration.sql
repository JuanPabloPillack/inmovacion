-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('ALQUILER_LOCACION', 'COMPRA_VENTA');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('ALQUILER_LOCACION', 'COMPRA_VENTA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "password" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'admin',
    "phone" TEXT,
    "status" TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "tipo_cliente" (
    "id_tipo_cliente" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipo_cliente_pkey" PRIMARY KEY ("id_tipo_cliente")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id_cliente" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100),
    "email" VARCHAR(100),
    "telefono" VARCHAR(50),
    "tipo_documento" VARCHAR(50),
    "tipoClienteId" INTEGER,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "tipo_inmueble" (
    "id_tipo_inmueble" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipo_inmueble_pkey" PRIMARY KEY ("id_tipo_inmueble")
);

-- CreateTable
CREATE TABLE "localidad" (
    "id_localidad" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "localidad_pkey" PRIMARY KEY ("id_localidad")
);

-- CreateTable
CREATE TABLE "barrio" (
    "id_barrio" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "id_localidad" INTEGER NOT NULL,

    CONSTRAINT "barrio_pkey" PRIMARY KEY ("id_barrio")
);

-- CreateTable
CREATE TABLE "ubicacion" (
    "id_ubicacion" SERIAL NOT NULL,
    "direccion" VARCHAR(200) NOT NULL,
    "ciudad" VARCHAR(100),
    "provincia" VARCHAR(100),
    "id_barrio" INTEGER,

    CONSTRAINT "ubicacion_pkey" PRIMARY KEY ("id_ubicacion")
);

-- CreateTable
CREATE TABLE "estado" (
    "id_estado" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "estado_pkey" PRIMARY KEY ("id_estado")
);

-- CreateTable
CREATE TABLE "operacion" (
    "id_operacion" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "operacion_pkey" PRIMARY KEY ("id_operacion")
);

-- CreateTable
CREATE TABLE "inmuebles" (
    "id_inmueble" SERIAL NOT NULL,
    "id_tipo_inmueble" INTEGER NOT NULL,
    "id_ubicacion" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "id_operacion" INTEGER,
    "id_cliente" INTEGER NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "superficie_total" DECIMAL(10,2) NOT NULL,
    "superficie_cubierta" DECIMAL(10,2),
    "cantidad_ambientes" INTEGER,
    "cantidad_banos" INTEGER,
    "cantidad_dormitorios" INTEGER,
    "cantidad_cocheras" INTEGER,
    "cantidad_pisos" INTEGER,
    "antiguedad" INTEGER,
    "precio" DECIMAL(12,2),
    "foto" VARCHAR(500),
    "detalles" TEXT,
    "archivado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "inmuebles_pkey" PRIMARY KEY ("id_inmueble")
);

-- CreateTable
CREATE TABLE "inmueble_imagen" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "inmuebleId" INTEGER NOT NULL,

    CONSTRAINT "inmueble_imagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "archivoPath" VARCHAR(500) NOT NULL,
    "camposVariables" JSONB,
    "tipo" "TemplateType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id_contrato" SERIAL NOT NULL,
    "id_inmueble" INTEGER NOT NULL,
    "id_cliente_1" INTEGER NOT NULL,
    "id_cliente_2" INTEGER NOT NULL,
    "id_template" INTEGER,
    "nombre" VARCHAR(100),
    "valores" JSONB,
    "archivoPath" VARCHAR(500),
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "tipo_contrato" "ContractType" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "firmado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id_contrato")
);

-- CreateTable
CREATE TABLE "rendiciones" (
    "id_rendicion" SERIAL NOT NULL,
    "id_inmueble" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "mes_ipc" INTEGER,
    "anio_ipc" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "rendiciones_pkey" PRIMARY KEY ("id_rendicion")
);

-- CreateTable
CREATE TABLE "cobranzas" (
    "id_cobranza" SERIAL NOT NULL,
    "id_inmueble" INTEGER,
    "id_cliente" INTEGER NOT NULL,
    "id_contrato" INTEGER,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha_cobranza" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medio_pago" VARCHAR(50) NOT NULL,
    "concepto" VARCHAR(150) NOT NULL,
    "numero_recibo" VARCHAR(50),
    "observaciones" VARCHAR(255),
    "genera_recibo" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "id_rendicion" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "cobranzas_pkey" PRIMARY KEY ("id_cobranza")
);

-- CreateTable
CREATE TABLE "recibos" (
    "id_recibo" SERIAL NOT NULL,
    "id_cobranza" INTEGER,
    "total" DECIMAL(12,2) NOT NULL,
    "descripcion" TEXT,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recibos_pkey" PRIMARY KEY ("id_recibo")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "id_inmueble" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "historial" (
    "id_historial" SERIAL NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "id_inmueble" INTEGER,
    "id_cliente" INTEGER,

    CONSTRAINT "historial_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "ipc" (
    "id" SERIAL NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fuente" TEXT NOT NULL,
    "fechaConsulta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ipc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_servicio" (
    "id_tipo_servicio" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipo_servicio_pkey" PRIMARY KEY ("id_tipo_servicio")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre_razon_social" VARCHAR(150) NOT NULL,
    "cuit_cuil" VARCHAR(20) NOT NULL,
    "correo_contacto" VARCHAR(100),
    "telefono_contacto" VARCHAR(50),
    "direccion" VARCHAR(200),
    "tipoServicioId" INTEGER NOT NULL,
    "datos_bancarios" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" VARCHAR(255),
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "estado_pago" (
    "id_estado_pago" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "estado_pago_pkey" PRIMARY KEY ("id_estado_pago")
);

-- CreateTable
CREATE TABLE "medio_pago" (
    "id_medio_pago" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "medio_pago_pkey" PRIMARY KEY ("id_medio_pago")
);

-- CreateTable
CREATE TABLE "pago_proveedor" (
    "id_pago" SERIAL NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "concepto" VARCHAR(255) NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,
    "medioPagoId" INTEGER NOT NULL,
    "comprobante" VARCHAR(255),
    "responsable" VARCHAR(150) NOT NULL,
    "estadoPagoId" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pago_proveedor_pkey" PRIMARY KEY ("id_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "inmueble_imagen_inmuebleId_idx" ON "inmueble_imagen"("inmuebleId");

-- CreateIndex
CREATE INDEX "cobranzas_id_inmueble_idx" ON "cobranzas"("id_inmueble");

-- CreateIndex
CREATE INDEX "cobranzas_id_cliente_idx" ON "cobranzas"("id_cliente");

-- CreateIndex
CREATE INDEX "cobranzas_id_rendicion_idx" ON "cobranzas"("id_rendicion");

-- CreateIndex
CREATE UNIQUE INDEX "recibos_id_cobranza_key" ON "recibos"("id_cobranza");

-- CreateIndex
CREATE UNIQUE INDEX "ipc_mes_anio_key" ON "ipc"("mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_servicio_nombre_key" ON "tipo_servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_cuit_cuil_key" ON "proveedores"("cuit_cuil");

-- CreateIndex
CREATE UNIQUE INDEX "estado_pago_nombre_key" ON "estado_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "medio_pago_nombre_key" ON "medio_pago"("nombre");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tipoClienteId_fkey" FOREIGN KEY ("tipoClienteId") REFERENCES "tipo_cliente"("id_tipo_cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barrio" ADD CONSTRAINT "barrio_id_localidad_fkey" FOREIGN KEY ("id_localidad") REFERENCES "localidad"("id_localidad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicacion" ADD CONSTRAINT "ubicacion_id_barrio_fkey" FOREIGN KEY ("id_barrio") REFERENCES "barrio"("id_barrio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_id_tipo_inmueble_fkey" FOREIGN KEY ("id_tipo_inmueble") REFERENCES "tipo_inmueble"("id_tipo_inmueble") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "ubicacion"("id_ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "estado"("id_estado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_id_operacion_fkey" FOREIGN KEY ("id_operacion") REFERENCES "operacion"("id_operacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmueble_imagen" ADD CONSTRAINT "inmueble_imagen_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmuebles"("id_inmueble") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_id_inmueble_fkey" FOREIGN KEY ("id_inmueble") REFERENCES "inmuebles"("id_inmueble") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_id_cliente_1_fkey" FOREIGN KEY ("id_cliente_1") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_id_cliente_2_fkey" FOREIGN KEY ("id_cliente_2") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_id_template_fkey" FOREIGN KEY ("id_template") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendiciones" ADD CONSTRAINT "rendiciones_id_inmueble_fkey" FOREIGN KEY ("id_inmueble") REFERENCES "inmuebles"("id_inmueble") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendiciones" ADD CONSTRAINT "rendiciones_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendiciones" ADD CONSTRAINT "rendiciones_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranzas" ADD CONSTRAINT "cobranzas_id_inmueble_fkey" FOREIGN KEY ("id_inmueble") REFERENCES "inmuebles"("id_inmueble") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranzas" ADD CONSTRAINT "cobranzas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranzas" ADD CONSTRAINT "cobranzas_id_rendicion_fkey" FOREIGN KEY ("id_rendicion") REFERENCES "rendiciones"("id_rendicion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranzas" ADD CONSTRAINT "cobranzas_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranzas" ADD CONSTRAINT "cobranzas_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_id_cobranza_fkey" FOREIGN KEY ("id_cobranza") REFERENCES "cobranzas"("id_cobranza") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_inmueble_fkey" FOREIGN KEY ("id_inmueble") REFERENCES "inmuebles"("id_inmueble") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial" ADD CONSTRAINT "historial_id_inmueble_fkey" FOREIGN KEY ("id_inmueble") REFERENCES "inmuebles"("id_inmueble") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial" ADD CONSTRAINT "historial_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipo_servicio"("id_tipo_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_proveedor" ADD CONSTRAINT "pago_proveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_proveedor" ADD CONSTRAINT "pago_proveedor_medioPagoId_fkey" FOREIGN KEY ("medioPagoId") REFERENCES "medio_pago"("id_medio_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_proveedor" ADD CONSTRAINT "pago_proveedor_estadoPagoId_fkey" FOREIGN KEY ("estadoPagoId") REFERENCES "estado_pago"("id_estado_pago") ON DELETE RESTRICT ON UPDATE CASCADE;
