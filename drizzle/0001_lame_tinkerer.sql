CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`providerId` int NOT NULL,
	`serviceId` int NOT NULL,
	`bookingDate` timestamp NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`duration` int NOT NULL,
	`status` enum('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`notes` text,
	`totalPrice` decimal(10,2) NOT NULL,
	`cancellationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('booking','review','status_change','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceId` int NOT NULL,
	`experience` int DEFAULT 0,
	`hourlyRate` decimal(10,2) NOT NULL,
	`availability` text,
	`rating` decimal(3,2) DEFAULT '0.00',
	`totalReviews` int DEFAULT 0,
	`completedBookings` int DEFAULT 0,
	`idDocument` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`customerId` int NOT NULL,
	`providerId` int NOT NULL,
	`serviceId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`descriptionAr` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`category` enum('cleaning','hospitality','gardening','other') NOT NULL,
	`icon` varchar(100),
	`image` text,
	`basePrice` decimal(10,2) NOT NULL,
	`priceUnit` varchar(50) NOT NULL DEFAULT 'hour',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','provider') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false NOT NULL;