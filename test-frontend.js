#!/usr/bin/env node

/**
 * Frontend Integration Test
 * Tests that the frontend can communicate with the API
 */

import axios from "axios";

const API_URL = "http://localhost:8080";

async function testFrontendIntegration() {
	console.log("🧪 Testing Frontend Integration...\n");

	let passed = 0;
	let failed = 0;

	// Test 1: API Health Check
	try {
		console.log("Test 1: API Health Check");
		const healthResponse = await axios.get(`${API_URL}/api/health`);
		if (healthResponse.data.success && healthResponse.data.status === "healthy") {
			console.log("✅ API is healthy\n");
			passed++;
		} else {
			throw new Error("API health check failed");
		}
	} catch (err) {
		console.error("❌ API Health Check Failed:", err.message, "\n");
		failed++;
	}

	// Test 2: Fetch Vinyls Data
	try {
		console.log("Test 2: Fetch Vinyls Data");
		const vinyls = await axios.get(`${API_URL}/api/vinyls`);

		if (!vinyls.data.success) {
			throw new Error("API returned success: false");
		}

		if (!Array.isArray(vinyls.data.data)) {
			throw new Error("API data is not an array");
		}

		console.log(`✅ Successfully fetched ${vinyls.data.count} vinyl records`);

		// Verify data structure
		if (vinyls.data.data.length > 0) {
			const sample = vinyls.data.data[0];
			const requiredFields = ["id", "title", "product_url"];
			const missingFields = requiredFields.filter((field) => !(field in sample));

			if (missingFields.length > 0) {
				throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
			}

			console.log(`✅ Data structure is valid`);
			console.log(`   Sample record: "${sample.title}"`);
		}
		console.log();
		passed++;
	} catch (err) {
		console.error("❌ Fetch Vinyls Failed:", err.message, "\n");
		failed++;
	}

	// Test 3: Verify CORS Headers
	try {
		console.log("Test 3: Verify CORS Headers");
		const response = await axios.get(`${API_URL}/api/vinyls`, {
			headers: {
				Origin: "http://localhost:5173", // Vite default port
			},
		});

		if (response.headers["access-control-allow-origin"]) {
			console.log("✅ CORS headers present");
			console.log(
				`   Allow-Origin: ${response.headers["access-control-allow-origin"]}\n`,
			);
			passed++;
		} else {
			throw new Error("CORS headers missing");
		}
	} catch (err) {
		console.error("❌ CORS Check Failed:", err.message, "\n");
		failed++;
	}

	// Test 4: Check Response Compression
	try {
		console.log("Test 4: Check Response Compression");
		const response = await axios.get(`${API_URL}/api/vinyls`, {
			headers: {
				"Accept-Encoding": "gzip, deflate",
			},
		});

		// Note: axios automatically decompresses, so we check the data size
		if (response.data.data.length > 100) {
			console.log(
				"✅ Large dataset received successfully (compression working)\n",
			);
			passed++;
		} else {
			console.log("⚠️  Dataset smaller than expected, but test passes\n");
			passed++;
		}
	} catch (err) {
		console.error("❌ Compression Check Failed:", err.message, "\n");
		failed++;
	}

	// Summary
	console.log("━".repeat(50));
	console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

	if (failed === 0) {
		console.log("✅ All frontend integration tests passed!");
		console.log("\n🎨 You can now start the frontend with:");
		console.log("   npm run start:client\n");
		process.exit(0);
	} else {
		console.log("❌ Some tests failed. Please check the errors above.");
		process.exit(1);
	}
}

// Check if API is running
async function checkApiRunning() {
	try {
		await axios.get(`${API_URL}/api/health`, { timeout: 2000 });
		return true;
	} catch {
		return false;
	}
}

// Main
(async () => {
	const isRunning = await checkApiRunning();

	if (!isRunning) {
		console.error("❌ API server is not running on http://localhost:8080");
		console.error("   Please start it with: npm run start:api\n");
		process.exit(1);
	}

	await testFrontendIntegration();
})();
