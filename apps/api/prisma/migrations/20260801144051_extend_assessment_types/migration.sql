-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssessmentType" ADD VALUE 'EPDS';
ALTER TYPE "AssessmentType" ADD VALUE 'SRQ20';
ALTER TYPE "AssessmentType" ADD VALUE 'AUDIT';
ALTER TYPE "AssessmentType" ADD VALUE 'PSS10';
ALTER TYPE "AssessmentType" ADD VALUE 'WHO5';
