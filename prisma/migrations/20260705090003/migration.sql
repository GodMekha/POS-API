/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HistoryInInventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HistoryInProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Package` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Part` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Purchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PurchaseDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sell` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SellDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Supply` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `HistoryInInventory` DROP FOREIGN KEY `HistoryInInventory_inventoryId_fkey`;

-- DropForeignKey
ALTER TABLE `HistoryInProduct` DROP FOREIGN KEY `HistoryInProduct_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDetail` DROP FOREIGN KEY `OrderDetail_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Purchase` DROP FOREIGN KEY `Purchase_supplyId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchaseDetail` DROP FOREIGN KEY `PurchaseDetail_purchaseId_fkey`;

-- DropForeignKey
ALTER TABLE `Sell` DROP FOREIGN KEY `Sell_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `Sell` DROP FOREIGN KEY `Sell_packageId_fkey`;

-- DropForeignKey
ALTER TABLE `SellDetail` DROP FOREIGN KEY `SellDetail_partId_fkey`;

-- DropForeignKey
ALTER TABLE `SellDetail` DROP FOREIGN KEY `SellDetail_sellId_fkey`;

-- DropIndex
DROP INDEX `HistoryInInventory_inventoryId_fkey` ON `HistoryInInventory`;

-- DropIndex
DROP INDEX `HistoryInProduct_productId_fkey` ON `HistoryInProduct`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `Order`;

-- DropIndex
DROP INDEX `OrderDetail_orderId_fkey` ON `OrderDetail`;

-- DropIndex
DROP INDEX `Product_categoryId_fkey` ON `Product`;

-- DropIndex
DROP INDEX `Purchase_supplyId_fkey` ON `Purchase`;

-- DropIndex
DROP INDEX `PurchaseDetail_purchaseId_fkey` ON `PurchaseDetail`;

-- DropIndex
DROP INDEX `Sell_customerId_fkey` ON `Sell`;

-- DropIndex
DROP INDEX `Sell_packageId_fkey` ON `Sell`;

-- DropIndex
DROP INDEX `SellDetail_partId_fkey` ON `SellDetail`;

-- DropIndex
DROP INDEX `SellDetail_sellId_fkey` ON `SellDetail`;

-- AlterTable
ALTER TABLE `Customer` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `HistoryInInventory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `inventoryId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `HistoryInProduct` DROP PRIMARY KEY,
    MODIFY `hip_id` VARCHAR(36) NOT NULL,
    MODIFY `productId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`hip_id`);

-- AlterTable
ALTER TABLE `Inventory` DROP PRIMARY KEY,
    MODIFY `inventory_id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`inventory_id`);

-- AlterTable
ALTER TABLE `Order` DROP PRIMARY KEY,
    MODIFY `order_id` VARCHAR(36) NOT NULL,
    MODIFY `userId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`order_id`);

-- AlterTable
ALTER TABLE `OrderDetail` DROP PRIMARY KEY,
    MODIFY `orderId` VARCHAR(36) NOT NULL,
    MODIFY `ordrd_id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`ordrd_id`);

-- AlterTable
ALTER TABLE `Package` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Part` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Product` DROP PRIMARY KEY,
    MODIFY `product_id` VARCHAR(36) NOT NULL,
    MODIFY `categoryId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`product_id`);

-- AlterTable
ALTER TABLE `Purchase` DROP PRIMARY KEY,
    MODIFY `purchase_id` VARCHAR(36) NOT NULL,
    MODIFY `supplyId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`purchase_id`);

-- AlterTable
ALTER TABLE `PurchaseDetail` DROP PRIMARY KEY,
    MODIFY `pd_id` VARCHAR(36) NOT NULL,
    MODIFY `purchaseId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`pd_id`);

-- AlterTable
ALTER TABLE `Sell` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `customerId` VARCHAR(36) NOT NULL,
    MODIFY `packageId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SellDetail` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `sellId` VARCHAR(36) NOT NULL,
    MODIFY `partId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Supply` DROP PRIMARY KEY,
    MODIFY `supply_id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`supply_id`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetail` ADD CONSTRAINT `OrderDetail_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryInProduct` ADD CONSTRAINT `HistoryInProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryInInventory` ADD CONSTRAINT `HistoryInInventory_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`inventory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `Supply`(`supply_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseDetail` ADD CONSTRAINT `PurchaseDetail_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`purchase_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sell` ADD CONSTRAINT `Sell_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sell` ADD CONSTRAINT `Sell_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SellDetail` ADD CONSTRAINT `SellDetail_sellId_fkey` FOREIGN KEY (`sellId`) REFERENCES `Sell`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SellDetail` ADD CONSTRAINT `SellDetail_partId_fkey` FOREIGN KEY (`partId`) REFERENCES `Part`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
