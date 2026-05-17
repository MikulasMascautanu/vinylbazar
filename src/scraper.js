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
 * Scrape products from a single page
 */
function scrapeProductsFromPage(root, categoryName) {
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
 * Find the next page URL from the current page
 */
function findNextPageUrl(root) {
	const nextLink = root.querySelector(config.selectors.nextPage);
	if (!nextLink) return null;

	const href = nextLink.getAttribute("href");
	if (!href) return null;

	return href.startsWith("http") ? href : `${config.baseUrl}${href}`;
}

/**
 * Add delay between requests
 */
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Scrape all pages from a category
 * Supports incremental mode: stops when hitting existing products
 */
async function scrapeCategoryAllPages(
	categoryUrl,
	categoryName,
	categoryIndex,
	totalCategories,
) {
	const allProducts = [];
	let currentUrl = categoryUrl;
	let pageNumber = 1;
	const failedUrls = [];
	let consecutiveExisting = 0;
	let stoppedEarly = false;

	while (currentUrl) {
		try {
			// Fetch and parse the page
			const html = await fetchHTML(currentUrl);
			const root = parse(html);

			// Extract products from this page
			const products = scrapeProductsFromPage(root, categoryName);

			// In incremental mode, check if products already exist
			if (config.scraping.incrementalMode) {
				for (const product of products) {
					const exists = await db.productExists(product.product_url);
					if (exists) {
						consecutiveExisting++;
					} else {
						consecutiveExisting = 0; // Reset counter when we find a new product
					}

					allProducts.push(product);

					// Stop if we've hit enough consecutive existing products
					if (consecutiveExisting >= config.scraping.stopAfterExisting) {
						console.log(
							`⏸️  Incremental mode: Found ${consecutiveExisting} consecutive existing products. Stopping category.`,
						);
						stoppedEarly = true;
						break;
					}
				}

				if (stoppedEarly) {
					break;
				}
			} else {
				// Full scraping mode: add all products
				allProducts.push(...products);
			}

			// Log progress
			console.log(
				`Category: ${categoryName} (${categoryIndex}/${totalCategories}) | Page ${pageNumber} | Products: ${products.length} | Total: ${allProducts.length}${config.scraping.incrementalMode ? ` | Consecutive existing: ${consecutiveExisting}` : ""}`,
			);

			// Find next page URL
			const nextUrl = findNextPageUrl(root);

			// Add delay before next request
			if (nextUrl) {
				await delay(config.scraping.requestDelay);
			}

			currentUrl = nextUrl;
			pageNumber++;
		} catch (error) {
			console.error(
				`Error scraping page ${pageNumber} of ${categoryName}:`,
				error.message,
			);
			console.error(`Failed URL: ${currentUrl}`);
			failedUrls.push({
				url: currentUrl,
				category: categoryName,
				page: pageNumber,
			});

			// Continue to next page if available (but we can't get it from failed page)
			break;
		}
	}

	return { products: allProducts, failedUrls, stoppedEarly };
}

/**
 * Main scraping function
 * Phase 2: Extract categories and scrape all categories with pagination
 */
export async function scrapeVinyls() {
	console.log("Starting vinyl scraper...\n");

	// Extract all categories
	const categories = await extractCategories();
	console.log("\nCategories found:");
	categories.forEach((cat, index) => {
		console.log(`  ${index + 1}. ${cat.name}`);
	});
	console.log(); // Empty line for readability

	if (categories.length === 0) {
		console.log("No categories found!");
		return;
	}

	// Track overall statistics
	let totalInserted = 0;
	let totalSkipped = 0;
	let totalScraped = 0;
	const allFailedUrls = [];

	// Scrape all categories
	for (let i = 0; i < categories.length; i++) {
		const category = categories[i];
		const categoryIndex = i + 1;

		console.log(`\n${"=".repeat(60)}`);
		console.log(
			`Starting category: ${category.name} (${categoryIndex}/${categories.length})`,
		);
		console.log(`URL: ${category.url}`);
		console.log("=".repeat(60));

		try {
			// Scrape all pages in this category
			const { products, failedUrls } = await scrapeCategoryAllPages(
				category.url,
				category.name,
				categoryIndex,
				categories.length,
			);

			totalScraped += products.length;
			allFailedUrls.push(...failedUrls);

			console.log(
				`\nCategory "${category.name}" complete: ${products.length} products scraped`,
			);

			// Insert products into database
			let categoryInserted = 0;
			let categoryUpdated = 0;

			for (const product of products) {
				try {
					const result = await db.insertVinyl(product);
					if (result.isNew) {
						categoryInserted++;
					} else {
						categoryUpdated++;
					}
				} catch (error) {
					console.error(
						`Error inserting product "${product.title}":`,
						error.message,
					);
				}
			}

			totalInserted += categoryInserted;
			totalSkipped += categoryUpdated;

			console.log(`Database: ${categoryInserted} new, ${categoryUpdated} updated`);

			// Add delay between categories
			if (categoryIndex < categories.length) {
				await delay(config.scraping.requestDelay);
			}
		} catch (error) {
			console.error(`Error scraping category "${category.name}":`, error.message);
			allFailedUrls.push({
				url: category.url,
				category: category.name,
				page: "category-level-error",
			});
		}
	}

	// Print final summary
	console.log(`\n${"=".repeat(60)}`);
	console.log("SCRAPING COMPLETE");
	console.log("=".repeat(60));
	console.log(`Categories processed: ${categories.length}`);
	console.log(`Total products scraped: ${totalScraped}`);
	console.log(`Database new records: ${totalInserted}`);
	console.log(`Database updated records: ${totalSkipped}`);
	console.log(`Total in database: ${await db.getCount()}`);

	if (allFailedUrls.length > 0) {
		console.log(`\n⚠️  Failed URLs: ${allFailedUrls.length}`);
		allFailedUrls.forEach((failed) => {
			console.log(`  - ${failed.category} (Page ${failed.page}): ${failed.url}`);
		});
	} else {
		console.log(`\n✅ All pages scraped successfully!`);
	}
	console.log("=".repeat(60));
}
