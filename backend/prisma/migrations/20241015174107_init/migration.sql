-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messages" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
