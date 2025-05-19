-- CreateTable
CREATE TABLE "Reservations" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "service_type" TEXT NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "reservation_data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_reservations_email" ON "Reservations"("email");

-- CreateIndex
CREATE INDEX "idx_reservations_created_at" ON "Reservations"("created_at");
