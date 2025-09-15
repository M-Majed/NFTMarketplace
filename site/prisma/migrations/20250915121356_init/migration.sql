/*
  Warnings:

  - Added the required column `txHash` to the `NFT` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NFT" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "txHash" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NFT_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NFT" ("createdAt", "description", "height", "id", "imageUrl", "metadata", "name", "ownerId", "size", "tokenId", "width") SELECT "createdAt", "description", "height", "id", "imageUrl", "metadata", "name", "ownerId", "size", "tokenId", "width" FROM "NFT";
DROP TABLE "NFT";
ALTER TABLE "new_NFT" RENAME TO "NFT";
CREATE UNIQUE INDEX "NFT_tokenId_key" ON "NFT"("tokenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
