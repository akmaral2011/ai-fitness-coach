ALTER TABLE "WorkoutSession" ADD COLUMN "clientMutationId" TEXT;

CREATE UNIQUE INDEX "WorkoutSession_userId_clientMutationId_key"
ON "WorkoutSession"("userId", "clientMutationId");
