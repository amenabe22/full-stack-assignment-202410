-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messages" TEXT NOT NULL,
    "convId" TEXT,
    "isAI" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Conversation" ("convId", "createdAt", "id", "messages") SELECT "convId", "createdAt", "id", "messages" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
