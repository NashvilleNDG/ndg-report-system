-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "clientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "industry" TEXT,
    "contactEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DriveConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "driveFileName" TEXT,
    "sheetName" TEXT,
    "lastSyncedAt" DATETIME,
    "syncStatus" TEXT,
    "syncError" TEXT,
    CONSTRAINT "DriveConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialMediaData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    CONSTRAINT "SocialMediaData_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstagramData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socialMediaDataId" TEXT NOT NULL,
    "followers" INTEGER,
    "followersChange" INTEGER,
    "likes" INTEGER,
    "reach" INTEGER,
    "impressions" INTEGER,
    "engagement" REAL,
    CONSTRAINT "InstagramData_socialMediaDataId_fkey" FOREIGN KEY ("socialMediaDataId") REFERENCES "SocialMediaData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacebookData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socialMediaDataId" TEXT NOT NULL,
    "followers" INTEGER,
    "followersChange" INTEGER,
    "likes" INTEGER,
    "reach" INTEGER,
    "impressions" INTEGER,
    "engagement" REAL,
    CONSTRAINT "FacebookData_socialMediaDataId_fkey" FOREIGN KEY ("socialMediaDataId") REFERENCES "SocialMediaData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YouTubeData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socialMediaDataId" TEXT NOT NULL,
    "subscribers" INTEGER,
    "subscribersChange" INTEGER,
    "likes" INTEGER,
    "views" INTEGER,
    "impressions" INTEGER,
    "engagement" REAL,
    CONSTRAINT "YouTubeData_socialMediaDataId_fkey" FOREIGN KEY ("socialMediaDataId") REFERENCES "SocialMediaData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TikTokData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socialMediaDataId" TEXT NOT NULL,
    "followers" INTEGER,
    "followersChange" INTEGER,
    "likes" INTEGER,
    "reach" INTEGER,
    "impressions" INTEGER,
    "engagement" REAL,
    CONSTRAINT "TikTokData_socialMediaDataId_fkey" FOREIGN KEY ("socialMediaDataId") REFERENCES "SocialMediaData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebsiteData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "sessions" INTEGER,
    "users" INTEGER,
    "pageviews" INTEGER,
    "bounceRate" REAL,
    "conversions" INTEGER,
    "conversionRate" REAL,
    CONSTRAINT "WebsiteData_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GMBData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "profileViews" INTEGER,
    "searchImpressions" INTEGER,
    "businessInteractions" INTEGER,
    "clicks" INTEGER,
    "calls" INTEGER,
    "directionRequests" INTEGER,
    CONSTRAINT "GMBData_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clientId_key" ON "User"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DriveConfig_clientId_key" ON "DriveConfig"("clientId");

-- CreateIndex
CREATE INDEX "Report_clientId_period_idx" ON "Report"("clientId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Report_clientId_period_key" ON "Report"("clientId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaData_reportId_key" ON "SocialMediaData"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramData_socialMediaDataId_key" ON "InstagramData"("socialMediaDataId");

-- CreateIndex
CREATE UNIQUE INDEX "FacebookData_socialMediaDataId_key" ON "FacebookData"("socialMediaDataId");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeData_socialMediaDataId_key" ON "YouTubeData"("socialMediaDataId");

-- CreateIndex
CREATE UNIQUE INDEX "TikTokData_socialMediaDataId_key" ON "TikTokData"("socialMediaDataId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteData_reportId_key" ON "WebsiteData"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "GMBData_reportId_key" ON "GMBData"("reportId");
