-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "aceptaRecordatorios" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentimientoFecha" TIMESTAMP(3);
