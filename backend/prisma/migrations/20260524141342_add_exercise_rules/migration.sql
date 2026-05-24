-- CreateTable
CREATE TABLE "ExerciseRule" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "joint" TEXT NOT NULL,
    "landmarks" JSONB NOT NULL,
    "angleMin" DOUBLE PRECISION NOT NULL,
    "angleMax" DOUBLE PRECISION NOT NULL,
    "severity" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseRule_exerciseId_idx" ON "ExerciseRule"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseRule_exerciseId_code_key" ON "ExerciseRule"("exerciseId", "code");

-- AddForeignKey
ALTER TABLE "ExerciseRule" ADD CONSTRAINT "ExerciseRule_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
