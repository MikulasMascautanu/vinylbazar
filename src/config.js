/**
 * Configuration file for Vinyl Bazar scraper
 * Contains selectors and constants used throughout the application
 */

export const config = {
	// Base URL for the website
	baseUrl: 'https://www.vinylbazar.net',

	// CSS selectors for scraping
	selectors: {
		menuItem: '.root-eshop-menu > .leftmenuDef a', // Category links
		product: '.productBody', // Product container
		nextPage: '[rel="next"]', // Pagination link
		title: '.productTitleContent a', // Product title
		price: '.product_price_text', // Product price
		img: '.img_box a img:first-of-type', // Product image
	},

	// Database configuration
	database: {
		path: './data/vinyls.db',
	},

	// Scraping configuration
	scraping: {
		// Delay between requests in milliseconds (to be respectful)
		requestDelay: 500,
		// Maximum number of retries for failed requests
		maxRetries: 3,
	},
};
