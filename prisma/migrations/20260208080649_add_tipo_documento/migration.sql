/*
  Warnings:

  - You are about to drop the column `tipo_documento` on the `clientes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "tipo_documento",
ADD COLUMN     "dumero_documento" VARCHAR(50),
ADD COLUMN     "tipoDocumentoId" INTEGER;

-- CreateTable
CREATE TABLE "tipo_documento" (
    "id_tipo_documento" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "longitud_min" INTEGER NOT NULL,
    "longitud_max" INTEGER NOT NULL,
    "solo_numeros" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" VARCHAR(150),

    CONSTRAINT "tipo_documento_pkey" PRIMARY KEY ("id_tipo_documento")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_documento_nombre_key" ON "tipo_documento"("nombre");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipo_documento"("id_tipo_documento") ON DELETE SET NULL ON UPDATE CASCADE;
