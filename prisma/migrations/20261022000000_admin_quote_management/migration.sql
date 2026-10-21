ALTER TABLE `Booking`
    ADD COLUMN `quotedAmountPaise` INTEGER NULL,
    ADD COLUMN `quotedAt` DATETIME(3) NULL,
    ADD COLUMN `adminNotes` TEXT NULL;

ALTER TABLE `Enquiry`
    ADD COLUMN `quotedAmountPaise` INTEGER NULL,
    ADD COLUMN `quotedAt` DATETIME(3) NULL,
    ADD COLUMN `adminNotes` TEXT NULL;

ALTER TABLE `ContactMessage`
    ADD COLUMN `adminNotes` TEXT NULL;
