/**
 * Database module for SQLite operations
 * Handles connection, schema initialization, and data operations
 */

import sqlite3 from "sqlite3";
import { config } from "./config.js";

// Create a promise-based wrapper for sqlite3
class Database {
	constructor(dbPath) {
		this.db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				console.error("Error opening database:", err.message);
			} else {
				console.log("Connected to SQLite database at", dbPath);
			}
		});
	}

	// Initialize database schema
	async init() {
		const schema = `
			CREATE TABLE IF NOT EXISTS vinyls (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				artist TEXT,
				price REAL,
				image_url TEXT,
				product_url TEXT UNIQUE NOT NULL,
				category TEXT,
				scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`;

		return new Promise((resolve, reject) => {
			this.db.run(schema, (err) => {
				if (err) {
					console.error("Error creating schema:", err.message);
					reject(err);
				} else {
					console.log("Database schema initialized");
					resolve();
				}
			});
		});
	}

	// Insert or update a vinyl record in the database
	// Returns: { id, isNew: true } for new records, { id, isNew: false } for updates
	async insertVinyl(vinyl) {
		// First check if the record exists
		const checkSql = `SELECT id FROM vinyls WHERE product_url = ?`;

		return new Promise((resolve, reject) => {
			this.db.get(checkSql, [vinyl.product_url], (err, row) => {
				if (err) {
					reject(err);
					return;
				}

				const isNew = !row;

				// Use INSERT OR REPLACE to handle both new and existing records
				const sql = `
					INSERT INTO vinyls (title, artist, price, image_url, product_url, category, scraped_at)
					VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
					ON CONFLICT(product_url) DO UPDATE SET
						title = excluded.title,
						artist = excluded.artist,
						price = excluded.price,
						image_url = excluded.image_url,
						category = excluded.category,
						scraped_at = CURRENT_TIMESTAMP
				`;

				this.db.run(
					sql,
					[
						vinyl.title,
						vinyl.artist,
						vinyl.price,
						vinyl.image_url,
						vinyl.product_url,
						vinyl.category,
					],
					function (err) {
						if (err) {
							reject(err);
						} else {
							resolve({ id: this.lastID, isNew });
						}
					},
				);
			});
		});
	}

	// Check if a product exists by URL
	async productExists(productUrl) {
		return new Promise((resolve, reject) => {
			this.db.get(
				"SELECT id FROM vinyls WHERE product_url = ?",
				[productUrl],
				(err, row) => {
					if (err) {
						reject(err);
					} else {
						resolve(!!row); // Returns true if row exists, false otherwise
					}
				},
			);
		});
	}

	// Get count of all vinyl records
	async getCount() {
		return new Promise((resolve, reject) => {
			this.db.get("SELECT COUNT(*) as count FROM vinyls", (err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(row.count);
				}
			});
		});
	}

	// Get all vinyl records
	async getAll() {
		return new Promise((resolve, reject) => {
			this.db.all("SELECT * FROM vinyls", (err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	// Close database connection
	async close() {
		return new Promise((resolve, reject) => {
			this.db.close((err) => {
				if (err) {
					reject(err);
				} else {
					console.log("Database connection closed");
					resolve();
				}
			});
		});
	}
}

// Export a singleton instance
export const db = new Database(config.database.path);
