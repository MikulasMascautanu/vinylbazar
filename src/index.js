/**
 * Entry point for the Vinyl Bazar scraper
 */

import { db } from "./db.js";
import { scrapeVinyls } from "./scraper.js";
import { sendEmailNotification } from "./notify.js";
import { config } from "./config.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
	try {
		// Initialize database
		await db.init();

		// Run scraper
		console.log("Starting vinyl scraper...\n");
		await scrapeVinyls();

		// Check for new records and send notification if enabled
		if (config.notification.enabled) {
			console.log("\n📧 Checking for new records to notify about...");

			try {
				const newRecords = await db.getNewRecords();

				if (newRecords.length >= config.notification.minRecordsThreshold) {
					console.log(
						`📬 Found ${newRecords.length} new record(s) not yet notified`,
					);
					console.log(`📧 Sending email notification...`);

					const result = await sendEmailNotification(newRecords);

					if (result.success) {
						console.log(`✅ Email notification sent successfully!`);

						// Mark records as notified so we don't send them again
						const recordIds = newRecords.map((r) => r.id);
						await db.markAsNotified(recordIds);
						console.log(`✅ Marked ${recordIds.length} record(s) as notified`);
					} else {
						console.log(`⚠️  Email notification was not sent: ${result.message}`);
						console.log(`   Records will remain unmarked and retry next time.`);
					}
				} else {
					console.log(
						`ℹ️  No new records to notify about (threshold: ${config.notification.minRecordsThreshold})`,
					);
					console.log(`   Skipping notification.`);
				}
			} catch (notificationError) {
				// Don't fail the entire scrape if notification fails
				console.error(
					`❌ Failed to send notification: ${notificationError.message}`,
				);
				console.error(
					`   Scraping completed successfully, but notification failed.`,
				);
			}
		} else {
			console.log("\nℹ️  Email notifications are disabled in config");
		}

		// Close database connection
		await db.close();

		console.log("\n✅ Scraping completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Fatal error:", error.message);
		console.error(error.stack);

		// Try to close database connection
		try {
			await db.close();
		} catch (closeError) {
			console.error("Error closing database:", closeError.message);
		}

		process.exit(1);
	}
}

main();
