/**
 * Test script to verify getNewRecords() function
 * Tests the database query for records that haven't been notified yet
 */

import { db } from "./src/db.js";

async function testGetNewRecords() {
	console.log("🧪 Testing getNewRecords() function...\n");

	try {
		// Initialize database
		await db.init();

		// Get new records not yet notified
		console.log("📊 Querying for records not yet notified (notified=0)...");
		const newRecords = await db.getNewRecords();

		console.log(`\n✅ Query successful!`);
		console.log(`📦 Found ${newRecords.length} record(s) not yet notified\n`);

		if (newRecords.length > 0) {
			console.log("Sample records:");
			newRecords.slice(0, 5).forEach((record, index) => {
				console.log(`\n${index + 1}. ${record.title}`);
				console.log(`   Artist: ${record.artist || "N/A"}`);
				console.log(`   Price: ${record.price} Kč`);
				console.log(`   Category: ${record.category || "N/A"}`);
				console.log(`   Created: ${record.created_at}`);
			});

			if (newRecords.length > 5) {
				console.log(`\n... and ${newRecords.length - 5} more record(s)`);
			}
		} else {
			console.log("ℹ️  No unnotified records found.");
			console.log(
				"💡 This is expected if all scraped records have been notified.",
			);
			console.log("   To test with data, run: npm run scrape");
		}

		// Close database
		await db.close();

		console.log("\n✅ Test completed successfully!\n");
	} catch (error) {
		console.error("\n❌ Test failed:", error.message);
		console.error(error.stack);

		try {
			await db.close();
		} catch (closeError) {
			// Ignore close errors
		}

		process.exit(1);
	}
}

testGetNewRecords();
