/*
  Warnings:

  - Made the column `full_name` on table `Applicants` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Applicants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "job_title" TEXT,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribedAt" DATETIME,
    "unsubscribedFromEmail" TEXT
);
INSERT INTO "new_Applicants" ("country", "email", "full_name", "id", "job_title", "phone") SELECT "country", "email", "full_name", "id", "job_title", "phone" FROM "Applicants";
DROP TABLE "Applicants";
ALTER TABLE "new_Applicants" RENAME TO "Applicants";
CREATE UNIQUE INDEX "Applicants_email_key" ON "Applicants"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
