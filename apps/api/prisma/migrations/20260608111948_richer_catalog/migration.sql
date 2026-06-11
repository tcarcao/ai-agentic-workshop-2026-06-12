-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "dietaryTags" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Mains',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("description", "dietaryTags", "id", "name", "priceCents", "restaurantId") SELECT "description", "dietaryTags", "id", "name", "priceCents", "restaurantId" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE TABLE "new_Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ratingAvg" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "deliveryMinutes" INTEGER NOT NULL DEFAULT 30,
    "deliveryFeeCents" INTEGER NOT NULL DEFAULT 0,
    "priceLevel" INTEGER NOT NULL DEFAULT 2,
    "description" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Restaurant" ("cuisine", "id", "imageUrl", "name") SELECT "cuisine", "id", "imageUrl", "name" FROM "Restaurant";
DROP TABLE "Restaurant";
ALTER TABLE "new_Restaurant" RENAME TO "Restaurant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
