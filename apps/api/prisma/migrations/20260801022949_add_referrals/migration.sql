-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "referrals_patient_id_idx" ON "referrals"("patient_id");

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
