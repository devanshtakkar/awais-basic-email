-- CreateTable
CREATE TABLE "Applicants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT
);

-- CreateTable
CREATE TABLE "EmailLogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "emailSubject" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "EmailLogs_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicants_email_key" ON "Applicants"("email");
