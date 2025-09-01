-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT,
    "location" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es-MX',
    "culturalBackground" TEXT,
    "learningProfile" JSONB,
    "cognitiveLevel" INTEGER NOT NULL DEFAULT 3,
    "readingLevel" INTEGER NOT NULL DEFAULT 1,
    "hasInternet" BOOLEAN NOT NULL DEFAULT false,
    "deviceType" TEXT,
    "lastSync" DATETIME,
    "offlineData" JSONB,
    "teacherId" TEXT,
    "familyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Student_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpecialNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 2,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectionMethod" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    CONSTRAINT "SpecialNeed_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "baseContent" JSONB NOT NULL,
    "culturalVariants" JSONB NOT NULL,
    "languageVersions" JSONB NOT NULL,
    "accessibilityFeatures" JSONB NOT NULL,
    "offlinePackageUrl" TEXT,
    "offlineSize" INTEGER,
    "averageCompletionTime" INTEGER,
    "successRate" REAL,
    "prerequisites" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompletedLesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "timeSpent" INTEGER NOT NULL,
    "score" REAL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "helpUsed" JSONB,
    CONSTRAINT "CompletedLesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompletedLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "score" REAL NOT NULL,
    "details" JSONB NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "conductedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "school" TEXT,
    "region" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryContactName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "socioeconomicLevel" TEXT
);

-- CreateTable
CREATE TABLE "FamilyEngagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FamilyEngagement_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Achievement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "week" DATETIME NOT NULL,
    "lessonsTarget" INTEGER NOT NULL,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "minutesTarget" INTEGER NOT NULL,
    "minutesCompleted" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WeeklyGoal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "language" TEXT NOT NULL,
    "culturalContext" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherContent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "dataSize" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Student_location_idx" ON "Student"("location");

-- CreateIndex
CREATE INDEX "Student_language_idx" ON "Student"("language");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialNeed_studentId_type_key" ON "SpecialNeed"("studentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedLesson_studentId_lessonId_key" ON "CompletedLesson"("studentId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyGoal_studentId_week_key" ON "WeeklyGoal"("studentId", "week");
