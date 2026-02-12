/*
  Warnings:

  - You are about to drop the column `tipoClienteId` on the `clientes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_tipoClienteId_fkey";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "tipoClienteId";

-- CreateTable
CREATE TABLE "cliente_tipo_cliente" (
    "clienteId" INTEGER NOT NULL,
    "tipoClienteId" INTEGER NOT NULL,

    CONSTRAINT "cliente_tipo_cliente_pkey" PRIMARY KEY ("clienteId","tipoClienteId")
);

-- AddForeignKey
ALTER TABLE "cliente_tipo_cliente" ADD CONSTRAINT "cliente_tipo_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_tipo_cliente" ADD CONSTRAINT "cliente_tipo_cliente_tipoClienteId_fkey" FOREIGN KEY ("tipoClienteId") REFERENCES "tipo_cliente"("id_tipo_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;
