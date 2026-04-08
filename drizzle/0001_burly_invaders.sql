CREATE TABLE `banners` (
	`id` varchar(64) NOT NULL,
	`imageUrl` text NOT NULL,
	`title` varchar(512),
	`link` varchar(1024),
	`sortOrder` int DEFAULT 0,
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(512) NOT NULL,
	`description` text,
	`priceEUR` int NOT NULL DEFAULT 0,
	`priceTRY` int NOT NULL DEFAULT 0,
	`imageUrl` text,
	`imageUrls` json DEFAULT ('[]'),
	`mainCategory` varchar(128),
	`subCategory` varchar(128),
	`productCode` varchar(128),
	`colorCode` varchar(64),
	`videoUrl` text,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`key` varchar(128) NOT NULL,
	`value` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_key` PRIMARY KEY(`key`)
);
