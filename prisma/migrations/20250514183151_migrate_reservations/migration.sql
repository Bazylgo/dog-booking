-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "legacyId" INTEGER;

-- AlterTable
ALTER TABLE "Reservations" ADD COLUMN     "migrated" BOOLEAN NOT NULL DEFAULT false;
