/**
 * Automated tests for Phase 2: Multi-Page & Multi-Category Scraping
 * Tests that can be run programmatically without human intervention
 */

import sqlite3 from "sqlite3";
import { promisify } from "util";

const dbPath = "./data/vinyls.db";

async function runTests() {
	console.log("Running Phase 2 automated tests...\n");

	const db = new sqlite3.Database(dbPath);
	const dbAll = promisify(db.all.bind(db));
	const dbGet = promisify(db.get.bind(db));

	let passed = 0;
	let failed = 0;

	// Test 1: Database exists and has records
	try {
		const countResult = await dbGet("SELECT COUNT(*) as count FROM vinyls");
		const count = countResult.count;
		if (count > 500) {
			console.log(`✅ Test 1: Database has ${count} records (> 500 expected)`);
			passed++;
		} else {
			console.log(`❌ Test 1: Database has only ${count} records (expected > 500)`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ Test 1: Database query failed - ${error.message}`);
		failed++;
	}

	// Test 2: Multiple categories exist
	try {
		const categories = await dbAll("SELECT DISTINCT category FROM vinyls");
		if (categories.length >= 10) {
			console.log(`✅ Test 2: Database has ${categories.length} categories (>= 10 expected)`);
			passed++;
		} else {
			console.log(`❌ Test 2: Database has only ${categories.length} categories (expected >= 10)`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ Test 2: Category query failed - ${error.message}`);
		failed++;
	}

	// Test 3: No duplicate product_urls
	try {
		const duplicates = await dbAll(
			"SELECT product_url, COUNT(*) as count FROM vinyls GROUP BY product_url HAVING COUNT(*) > 1"
		);
		if (duplicates.length === 0) {
			console.log(`✅ Test 3: No duplicate product URLs found`);
			passed++;
		} else {
			console.log(`❌ Test 3: Found ${duplicates.length} duplicate product URLs`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ Test 3: Duplicate check failed - ${error.message}`);
		failed++;
	}

	// Test 4: All required fields populated
	try {
		const missingData = await dbGet(
			"SELECT COUNT(*) as count FROM vinyls WHERE title IS NULL OR product_url IS NULL OR category IS NULL"
		);
		if (missingData.count === 0) {
			console.log(`✅ Test 4: All records have required fields (title, product_url, category)`);
			passed++;
		} else {
			console.log(`❌ Test 4: Found ${missingData.count} records with missing required fields`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ Test 4: Missing data check failed - ${error.message}`);
		failed++;
	}

	// Test 5: Price fields are numeric
	try {
		const invalidPrices = await dbGet(
			"SELECT COUNT(*) as count FROM vinyls WHERE price IS NOT NULL AND (price < 0 OR price > 100000)"
		);
		if (invalidPrices.count === 0) {
			console.log(`✅ Test 5: All prices are within valid range`);
			passed++;
		} else {
			console.log(`❌ Test 5: Found ${invalidPrices.count} records with invalid prices`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ Test 5: Price validation failed - ${error.message}`);
		failed++;
	}

	// Test 6: Image URLs are absolute
	try {
		const invalidImages = await dbAll(
			"SELECT COUNT(*) as count FROM vinyls WHERE image_url IS NOT NULL AND image_url NOT LIKE 'http%'"
		);
		if (invalidImages[0].count === 0) {
			console.log(`✅ Test 6: All image URLs are absolute (start with http)`);
			passed++;
		} else {
			console.log(`❌ Test 6: Found ${invalidImages[0].count} relative image URLs`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ Test 6: Image URL validation failed - ${error.message}`);
		failed++;
	}

	// Test 7: Product URLs are absolute
	try {
		const invalidUrls = await dbAll(
			"SELECT COUNT(*) as count FROM vinyls WHERE product_url NOT LIKE 'http%'"
		);
		if (invalidUrls[0].count === 0) {
			console.log(`✅ Test 7: All product URLs are absolute (start with http)`);
			passed++;
		} else {
			console.log(`❌ Test 7: Found ${invalidUrls[0].count} relative product URLs`);
			failed++;
		}
	} catch (error) {
		console.log(`❌ Test 7: Product URL validation failed - ${error.message}`);
		failed++;
	}

	db.close();

	console.log(`\n${"=".repeat(60)}`);
	console.log(`AUTOMATED TEST RESULTS`);
	console.log("=".repeat(60));
	console.log(`Passed: ${passed}`);
	console.log(`Failed: ${failed}`);
	console.log(`Total: ${passed + failed}`);
	console.log("=".repeat(60));

	process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
	console.error("Test suite failed:", error);
	process.exit(1);
});
