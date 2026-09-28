-- AlterTable
ALTER TABLE "Actividad" ADD COLUMN     "estatus" TEXT NOT NULL DEFAULT 'aprobado',
ADD COLUMN     "instructor_id" INTEGER,
ADD COLUMN     "observaciones_admin" TEXT;

-- AlterTable
ALTER TABLE "Alumno" ADD COLUMN     "barrio_comunidad" TEXT;

-- AlterTable
ALTER TABLE "Asistencia" ADD COLUMN     "comprobante_url" TEXT;

-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "gestiona_alumnos" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "JustificacionInstructor" (
    "id" SERIAL NOT NULL,
    "instructor_id" INTEGER NOT NULL,
    "taller_id" INTEGER,
    "fecha_falta" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "comprobante_url" TEXT,
    "estatus" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones_admin" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JustificacionInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JustificacionInstructor_instructor_id_idx" ON "JustificacionInstructor"("instructor_id");

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JustificacionInstructor" ADD CONSTRAINT "JustificacionInstructor_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JustificacionInstructor" ADD CONSTRAINT "JustificacionInstructor_taller_id_fkey" FOREIGN KEY ("taller_id") REFERENCES "Taller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
