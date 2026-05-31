/**
 * Configuration file for Vinyl Bazar scraper
 * Contains selectors and constants used throughout the application
 */

export const config = {
	// Base URL for the website
	baseUrl: "https://www.vinylbazar.net",

	// CSS selectors for scraping
	selectors: {
		menuItem: ".root-eshop-menu > .leftmenuDef a", // Category links
		product: ".productBody", // Product container
		nextPage: '[rel="next"]', // Pagination link
		title: ".productTitleContent a", // Product title
		price: ".product_price_text", // Product price
		img: ".img_box a img:first-of-type", // Product image
	},

	// Database configuration
	database: {
		path: "./data/vinyls.db",
	},

	// Scraping configuration
	scraping: {
		// Delay between requests in milliseconds (to be respectful)
		requestDelay: 500,
		// Maximum number of retries for failed requests
		maxRetries: 3,
		// Incremental scraping: stop when hitting existing products
		// Set to false to always scrape the entire site
		incrementalMode: true,
		// Number of consecutive existing products to encounter before stopping
		// (to handle occasional updates in the middle of the list)
		stopAfterExisting: 4,
	},

	// Email notification configuration
	notification: {
		// Enable/disable email notifications
		enabled: true,
		// Minimum number of new records to trigger notification (0 = send even if no new records)
		minRecordsThreshold: 1,
		// Frontend URL to include in email (can be overridden by FRONTEND_URL env var)
		frontendUrl: process.env.FRONTEND_URL || "https://www.vinylbazar.net",
	},
};
