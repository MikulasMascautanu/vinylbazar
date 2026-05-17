/**
 * Database module for SQLite operations
 * Handles connection, schema initialization, and data operations
 */

import sqlite3 from 'sqlite3';
import { config } from './config.js';

// Create a promise-based wrapper for sqlite3
class Database {
	constructor(dbPath) {
		this.db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				console.error('Error opening database:', err.message);
			} else {
				console.log('Connected to SQLite database at', dbPath);
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
					console.error('Error creating schema:', err.message);
					reject(err);
				} else {
					console.log('Database schema initialized');
					resolve();
				}
			});
		});
	}

	// Insert a vinyl record into the database
	async insertVinyl(vinyl) {
		const sql = `
			INSERT INTO vinyls (title, artist, price, image_url, product_url, category)
			VALUES (?, ?, ?, ?, ?, ?)
		`;

		return new Promise((resolve, reject) => {
			this.db.run(
				sql,
				[vinyl.title, vinyl.artist, vinyl.price, vinyl.image_url, vinyl.product_url, vinyl.category],
				function (err) {
					if (err) {
						// Ignore duplicate entries (unique constraint on product_url)
						if (err.message.includes('UNIQUE constraint failed')) {
							resolve({ id: null, skipped: true });
						} else {
							reject(err);
						}
					} else {
						resolve({ id: this.lastID, skipped: false });
					}
				}
			);
		});
	}

	// Get count of all vinyl records
	async getCount() {
		return new Promise((resolve, reject) => {
			this.db.get('SELECT COUNT(*) as count FROM vinyls', (err, row) => {
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
			this.db.all('SELECT * FROM vinyls', (err, rows) => {
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
					console.log('Database connection closed');
					resolve();
				}
			});
		});
	}
}

// Export a singleton instance
export const db = new Database(config.database.path);
