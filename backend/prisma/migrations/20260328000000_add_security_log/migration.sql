-- CreateTable
CREATE TABLE "security_logs" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_logs_event_idx" ON "security_logs"("event");
CREATE INDEX "security_logs_email_idx" ON "security_logs"("email");
CREATE INDEX "security_logs_userId_idx" ON "security_logs"("userId");
CREATE INDEX "security_logs_createdAt_idx" ON "security_logs"("createdAt");
