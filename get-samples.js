/**
 * Helper script to get random samples from database for manual verification
 */

import sqlite3 from "sqlite3";
import { promisify } from "util";

const dbPath = "./data/vinyls.db";

async function getSamples() {
	const db = new sqlite3.Database(dbPath);
	const dbAll = promisify(db.all.bind(db));

	console.log("Random samples for manual verification:\n");

	// Get 5 random products with all fields
	const samples = await dbAll(`
		SELECT title, artist, price, image_url, product_url, category
		FROM vinyls
		WHERE artist IS NOT NULL
		ORDER BY RANDOM()
		LIMIT 5
	`);

	samples.forEach((sample, index) => {
		console.log(`Sample ${index + 1}:`);
		console.log(`  Title: ${sample.title}`);
		console.log(`  Artist: ${sample.artist}`);
		console.log(`  Price: ${sample.price} Kč`);
		console.log(`  Category: ${sample.category}`);
		console.log(`  Product URL: ${sample.product_url}`);
		console.log(`  Image URL: ${sample.image_url}`);
		console.log();
	});

	db.close();
}

getSamples().catch((error) => {
	console.error("Failed to get samples:", error);
	process.exit(1);
});
