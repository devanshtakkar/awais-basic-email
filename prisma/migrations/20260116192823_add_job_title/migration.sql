-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Applicants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "job_title" TEXT
);
INSERT INTO "new_Applicants" ("country", "email", "first_name", "id", "last_name", "phone") SELECT "country", "email", "first_name", "id", "last_name", "phone" FROM "Applicants";
DROP TABLE "Applicants";
ALTER TABLE "new_Applicants" RENAME TO "Applicants";
CREATE UNIQUE INDEX "Applicants_email_key" ON "Applicants"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
