/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `image` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Category` DROP PRIMARY KEY,
    MODIFY `category_id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`category_id`);

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `image` VARCHAR(191) NOT NULL;
