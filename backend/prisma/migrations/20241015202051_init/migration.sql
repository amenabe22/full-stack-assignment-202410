/*
  Warnings:

  - Added the required column `convId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messages" TEXT NOT NULL,
    "convId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Conversation" ("createdAt", "id", "messages") SELECT "createdAt", "id", "messages" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
