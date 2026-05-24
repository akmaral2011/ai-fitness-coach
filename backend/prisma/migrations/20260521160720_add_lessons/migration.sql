-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('ARTICLE', 'VIDEO');

-- CreateEnum
CREATE TYPE "LessonCategory" AS ENUM ('TECHNIQUE', 'TRAINING', 'RECOVERY', 'BEGINNER');

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "type" "LessonType" NOT NULL,
    "category" "LessonCategory" NOT NULL,
    "emoji" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyTakeaways" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "readMinutes" INTEGER,
    "durationMinutes" INTEGER,
    "youtubeVideoId" TEXT,
    "linkedExerciseId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
