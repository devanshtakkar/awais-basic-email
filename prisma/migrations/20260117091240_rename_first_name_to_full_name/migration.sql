-- Add full_name column as optional first
ALTER TABLE "Applicants" ADD COLUMN "full_name" TEXT;

-- Copy data from first_name to full_name
UPDATE "Applicants" SET "full_name" = "first_name";

-- Drop first_name and last_name columns
ALTER TABLE "Applicants" DROP COLUMN "first_name";
ALTER TABLE "Applicants" DROP COLUMN "last_name";

-- Make full_name NOT NULL
-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
-- This is handled by Prisma's internal migration system
