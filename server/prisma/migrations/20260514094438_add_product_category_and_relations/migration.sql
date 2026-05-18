/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `priceAtPurchase` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `stockQuantity` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'Очікує';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "priceAtPurchase",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stockQuantity",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Запчастини',
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
DROP COLUMN "role",
ADD COLUMN     "password" TEXT NOT NULL;
