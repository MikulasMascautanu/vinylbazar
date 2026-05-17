/**
 * Entry point for the Vinyl Bazar scraper
 */

import { db } from './db.js';
import { scrapeVinyls } from './scraper.js';

async function main() {
	try {
		// Initialize database
		await db.init();

		// Run scraper
		await scrapeVinyls();

		// Close database connection
		await db.close();

		console.log('\nScraping completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\nFatal error:', error.message);
		console.error(error.stack);

		// Try to close database connection
		try {
			await db.close();
		} catch (closeError) {
			console.error('Error closing database:', closeError.message);
		}

		process.exit(1);
	}
}

main();
