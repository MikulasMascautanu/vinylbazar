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
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				notified INTEGER DEFAULT 0
			)
		`;

		return new Promise((resolve, reject) => {
			this.db.run(schema, (err) => {
				if (err) {
					console.error("Error creating schema:", err.message);
					reject(err);
				} else {
					console.log("Database schema initialized");

					// Migration 1: Add created_at column if it doesn't exist
					this.db.run(`ALTER TABLE vinyls ADD COLUMN created_at DATETIME`, (err) => {
						if (err && err.message.includes("duplicate column")) {
							// Column already exists, continue to next migration
							this.migrateNotifiedColumn(resolve, reject);
						} else if (err) {
							console.error("Error adding created_at column:", err.message);
							reject(err);
						} else {
							// Column was just added, populate it with scraped_at values
							console.log("Migrating created_at column for existing records...");
							this.db.run(
								`UPDATE vinyls SET created_at = scraped_at WHERE created_at IS NULL`,
								(err) => {
									if (err) {
										console.error("Error migrating created_at data:", err.message);
										reject(err);
									} else {
										console.log(
											"Migration complete: created_at populated from scraped_at",
										);
										// Continue to next migration
										this.migrateNotifiedColumn(resolve, reject);
									}
								},
							);
						}
					});
				}
			});
		});
	}

	// Migration helper: Add notified column
	migrateNotifiedColumn(resolve, reject) {
		this.db.run(
			`ALTER TABLE vinyls ADD COLUMN notified INTEGER DEFAULT 0`,
			(err) => {
				if (err && err.message.includes("duplicate column")) {
					// Column already exists, migration complete
					resolve();
				} else if (err) {
					console.error("Error adding notified column:", err.message);
					reject(err);
				} else {
					// Column was just added, set all existing records to notified=1 (already exist, don't notify)
					console.log("Migrating notified column for existing records...");
					this.db.run(
						`UPDATE vinyls SET notified = 1 WHERE notified IS NULL`,
						(err) => {
							if (err) {
								console.error("Error migrating notified data:", err.message);
								reject(err);
							} else {
								console.log("Migration complete: existing records marked as notified");
								resolve();
							}
						},
					);
				}
			},
		);
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
					INSERT INTO vinyls (title, artist, price, image_url, product_url, category, created_at, scraped_at, notified)
					VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
					ON CONFLICT(product_url) DO UPDATE SET
						title = excluded.title,
						artist = excluded.artist,
						price = excluded.price,
						image_url = excluded.image_url,
						category = excluded.category,
						scraped_at = CURRENT_TIMESTAMP
						-- created_at and notified are NOT updated, preserving the original values
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

	// Get records that haven't been notified yet (for email notifications)
	// Returns array with: id, title, artist, price, category, image_url, product_url
	async getNewRecords() {
		return new Promise((resolve, reject) => {
			const sql = `
				SELECT id, title, artist, price, category, image_url, product_url, created_at
				FROM vinyls
				WHERE notified = 0
				ORDER BY created_at DESC
			`;

			this.db.all(sql, (err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows || []);
				}
			});
		});
	}

	// Mark records as notified
	async markAsNotified(recordIds) {
		if (!recordIds || recordIds.length === 0) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const placeholders = recordIds.map(() => "?").join(",");
			const sql = `UPDATE vinyls SET notified = 1 WHERE id IN (${placeholders})`;

			this.db.run(sql, recordIds, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
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
