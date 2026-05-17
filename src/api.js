/**
 * Express API Server
 * Provides REST API endpoint for accessing vinyl records data
 */

import express from "express";
import cors from "cors";
import compression from "compression";
import { db } from "./db.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
// Enable CORS only for specific origins (frontend development and production)
app.use(
	cors({
		origin: [
			"http://localhost:3000", // React development server
			"http://localhost:5173", // Vite development server
			"https://yourdomain.com", // Production frontend (update this when deploying)
		],
		credentials: true, // Allow cookies if needed in the future
	}),
);
app.use(compression()); // Enable gzip compression
app.use(express.json()); // Parse JSON request bodies

/**
 * GET /api/vinyls
 * Returns all vinyl records from the database
 *
 * Response format:
 * {
 *   "success": true,
 *   "count": number,
 *   "data": [ { id, title, artist, price, image_url, product_url, category, scraped_at }, ... ]
 * }
 */
app.get("/api/vinyls", async (req, res) => {
	try {
		const vinyls = await db.getAll();

		res.json({
			success: true,
			count: vinyls.length,
			data: vinyls,
		});
	} catch (error) {
		console.error("Error fetching vinyls:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch vinyl records",
			message: error.message,
		});
	}
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

/**
 * GET /
 * Root endpoint - API info
 */
app.get("/", (req, res) => {
	res.json({
		name: "Vinyl Bazar API",
		version: "1.0.0",
		endpoints: {
			vinyls: "/api/vinyls",
			health: "/api/health",
		},
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: "Endpoint not found",
	});
});

// Error handler
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	res.status(500).json({
		success: false,
		error: "Internal server error",
		message: err.message,
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🎵 Vinyl Bazar API server running on http://localhost:${PORT}`);
	console.log(`📊 Endpoints:`);
	console.log(`   - GET /api/vinyls - Get all vinyl records`);
	console.log(`   - GET /api/health  - Health check`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("SIGTERM received, closing server gracefully...");
	await db.close();
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("\nSIGINT received, closing server gracefully...");
	await db.close();
	process.exit(0);
});
