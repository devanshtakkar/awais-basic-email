-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailLogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "emailSubject" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "openedAt" DATETIME,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "lastOpenedAt" DATETIME,
    "openedFromIp" TEXT,
    "openedFromUserAgent" TEXT,
    "clickedAt" DATETIME,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastClickedAt" DATETIME,
    "clickedUrl" TEXT,
    "clickedFromIp" TEXT,
    "clickedFromUserAgent" TEXT,
    CONSTRAINT "EmailLogs_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmailLogs" ("applicantId", "emailBody", "emailSubject", "errorMessage", "id", "retryCount", "sentAt", "status", "templateName") SELECT "applicantId", "emailBody", "emailSubject", "errorMessage", "id", "retryCount", "sentAt", "status", "templateName" FROM "EmailLogs";
DROP TABLE "EmailLogs";
ALTER TABLE "new_EmailLogs" RENAME TO "EmailLogs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
