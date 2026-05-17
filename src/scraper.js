/**
 * Main scraper module
 * Handles fetching and parsing HTML from vinylbazar.net
 */

import fetch from "node-fetch";
import { parse } from "node-html-parser";
import { config } from "./config.js";
import { db } from "./db.js";

/**
 * Fetch HTML from a URL
 */
async function fetchHTML(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const html = await response.text();
		return html;
	} catch (error) {
		console.error(`Error fetching ${url}:`, error.message);
		throw error;
	}
}

/**
 * Extract category URLs from the homepage
 */
async function extractCategories() {
	console.log("Extracting categories from homepage...");
	const html = await fetchHTML(config.baseUrl);
	const root = parse(html);

	const categoryLinks = root.querySelectorAll(config.selectors.menuItem);
	const categories = [];

	categoryLinks.forEach((link) => {
		const href = link.getAttribute("href");
		const name = link.text.trim();

		if (href && name) {
			// Convert relative URLs to absolute
			const url = href.startsWith("http") ? href : `${config.baseUrl}${href}`;
			categories.push({ name, url });
		}
	});

	console.log(`Found ${categories.length} categories`);
	return categories;
}

/**
 * Parse artist and title from product title string
 * Pattern: "FORMAT Artist – Title" (em-dash separator)
 * Examples:
 *   "LP+7" Jefferson Starship – Gold" -> artist: "Jefferson Starship", title: "Gold (LP+7")"
 *   "LP Jerry Harrison : Casual Gods – Casual Gods" -> artist: "Jerry Harrison : Casual Gods", title: "Casual Gods (LP)"
 *   "2xLP Eminem – Recovery" -> artist: "Eminem", title: "Recovery (2xLP)"
 */
function parseArtistAndTitle(fullTitle) {
	// Look for em-dash separator (–) which is different from hyphen (-)
	const emDashIndex = fullTitle.indexOf(" – ");

	if (emDashIndex > 0) {
		// Extract the part before em-dash (contains format + artist)
		const beforeDash = fullTitle.substring(0, emDashIndex).trim();
		// Extract title (after em-dash)
		const titlePart = fullTitle.substring(emDashIndex + 3).trim();

		// Extract format prefix (LP, 2xLP, LP+7", etc.)
		// Format is typically at the start, followed by space
		const formatMatch = beforeDash.match(/^([\dxLP+"'\s]+)\s+(.+)$/);

		if (formatMatch) {
			const format = formatMatch[1].trim();
			const artist = formatMatch[2].trim();
			const title = `${titlePart} (${format})`;

			return { artist, title };
		} else {
			// No format found, treat entire beforeDash as artist
			return {
				artist: beforeDash,
				title: titlePart,
			};
		}
	}

	// Fallback: no em-dash found, return title as-is with no artist
	return {
		artist: null,
		title: fullTitle.trim(),
	};
}

/**
 * Extract price from price text
 * Example: "1 234,56 Kč" -> 1234.56
 */
function parsePrice(priceText) {
	if (!priceText) return null;

	// Remove currency symbols and convert comma to dot
	const cleaned = priceText.replace(/[^\d,]/g, "").replace(",", ".");
	const price = parseFloat(cleaned);

	return isNaN(price) ? null : price;
}

/**
 * Scrape products from a category page
 */
async function scrapeCategoryPage(categoryUrl, categoryName) {
	const html = await fetchHTML(categoryUrl);
	const root = parse(html);

	const productElements = root.querySelectorAll(config.selectors.product);
	const products = [];

	productElements.forEach((productEl) => {
		try {
			// Extract title and product URL
			const titleEl = productEl.querySelector(config.selectors.title);
			const fullTitle = titleEl?.text.trim() || "";
			const productUrl = titleEl?.getAttribute("href") || "";

			// Parse artist and title
			const { artist, title } = parseArtistAndTitle(fullTitle);

			// Extract price
			const priceEl = productEl.querySelector(config.selectors.price);
			const priceText = priceEl?.text.trim() || "";
			const price = parsePrice(priceText);

			// Extract image URL
			const imgEl = productEl.querySelector(config.selectors.img);
			const imageUrl = imgEl?.getAttribute("src") || "";

			// Only add if we have at least title and product URL
			if (title && productUrl) {
				products.push({
					title,
					artist,
					price,
					image_url: imageUrl.startsWith("http")
						? imageUrl
						: `${config.baseUrl}${imageUrl}`,
					product_url: productUrl.startsWith("http")
						? productUrl
						: `${config.baseUrl}${productUrl}`,
					category: categoryName,
				});
			}
		} catch (error) {
			console.error("Error parsing product:", error.message);
		}
	});

	return products;
}

/**
 * Main scraping function
 * For Phase 1: Extract categories and scrape first category only
 */
export async function scrapeVinyls() {
	console.log("Starting vinyl scraper...\n");

	// Extract all categories
	const categories = await extractCategories();
	console.log("\nCategories found:");
	categories.forEach((cat, index) => {
		console.log(`  ${index + 1}. ${cat.name}`);
	});

	// For Phase 1: Scrape only the first category
	if (categories.length > 0) {
		const firstCategory = categories[0];
		console.log(`\nScraping first category: ${firstCategory.name}`);
		console.log(`URL: ${firstCategory.url}\n`);

		const products = await scrapeCategoryPage(
			firstCategory.url,
			firstCategory.name,
		);
		console.log(`Extracted ${products.length} products from first page\n`);

		// Insert products into database
		let inserted = 0;
		let skipped = 0;

		for (const product of products) {
			try {
				const result = await db.insertVinyl(product);
				if (result.skipped) {
					skipped++;
				} else {
					inserted++;
				}
			} catch (error) {
				console.error(`Error inserting product "${product.title}":`, error.message);
			}
		}

		console.log(`\nResults:`);
		console.log(`  Inserted: ${inserted}`);
		console.log(`  Skipped (duplicates): ${skipped}`);
		console.log(`  Total in database: ${await db.getCount()}`);
	} else {
		console.log("No categories found!");
	}
}
