-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'TONE', 'FLEXIBILITY', 'REHAB');

-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ExerciseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'CARDIO', 'MOBILITY', 'HIIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "pictureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" "FitnessGoal" NOT NULL,
    "level" "FitnessLevel" NOT NULL,
    "age" INTEGER,
    "heightCm" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "gender" TEXT,
    "activityLevel" TEXT,
    "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "difficulty" "ExerciseDifficulty" NOT NULL,
    "primaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secondaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" INTEGER NOT NULL DEFAULT 10,
    "estimatedSeconds" INTEGER NOT NULL DEFAULT 45,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "rulesConfig" JSONB,
    "commonErrors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "repCount" INTEGER NOT NULL,
    "averageScore" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "scoreHistory" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_completedAt_idx" ON "WorkoutSession"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "WorkoutSession_exerciseId_idx" ON "WorkoutSession"("exerciseId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
