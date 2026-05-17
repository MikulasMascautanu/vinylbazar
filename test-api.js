/**
 * Automated API Tests for Phase 4
 * Run this while the API server is running (npm run start:api)
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:8080";
const EXPECTED_RECORD_COUNT = 1844;

// ANSI color codes for output
const colors = {
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	reset: "\x1b[0m",
};

async function test(name, fn) {
	try {
		await fn();
		console.log(`${colors.green}✓${colors.reset} ${name}`);
		return true;
	} catch (error) {
		console.log(`${colors.red}✗${colors.reset} ${name}`);
		console.log(`  Error: ${error.message}`);
		return false;
	}
}

async function runTests() {
	console.log("\n🧪 Running API Tests...\n");

	let passed = 0;
	let failed = 0;

	// Test 1: Health endpoint
	if (
		await test("GET /api/health returns healthy status", async () => {
			const response = await fetch(`${BASE_URL}/api/health`);
			const data = await response.json();
			if (!data.success || data.status !== "healthy") {
				throw new Error("Health check failed");
			}
		})
	)
		passed++;
	else failed++;

	// Test 2: Root endpoint
	if (
		await test("GET / returns API info", async () => {
			const response = await fetch(`${BASE_URL}/`);
			const data = await response.json();
			if (!data.name || !data.endpoints) {
				throw new Error("Root endpoint missing expected fields");
			}
		})
	)
		passed++;
	else failed++;

	// Test 3: Vinyls endpoint returns data
	if (
		await test("GET /api/vinyls returns vinyl records", async () => {
			const response = await fetch(`${BASE_URL}/api/vinyls`);
			const data = await response.json();
			if (!data.success || !Array.isArray(data.data)) {
				throw new Error("Invalid response format");
			}
			if (data.count !== data.data.length) {
				throw new Error(
					`Count mismatch: count=${data.count}, data.length=${data.data.length}`,
				);
			}
		})
	)
		passed++;
	else failed++;

	// Test 4: Correct number of records
	if (
		await test(`GET /api/vinyls returns ${EXPECTED_RECORD_COUNT} records`, async () => {
			const response = await fetch(`${BASE_URL}/api/vinyls`);
			const data = await response.json();
			if (data.count !== EXPECTED_RECORD_COUNT) {
				throw new Error(
					`Expected ${EXPECTED_RECORD_COUNT} records, got ${data.count}`,
				);
			}
		})
	)
		passed++;
	else failed++;

	// Test 5: Records have required fields
	if (
		await test("Vinyl records have all required fields", async () => {
			const response = await fetch(`${BASE_URL}/api/vinyls`);
			const data = await response.json();
			const requiredFields = [
				"id",
				"title",
				"price",
				"image_url",
				"product_url",
				"category",
				"scraped_at",
			];
			const firstRecord = data.data[0];
			const missingFields = requiredFields.filter(
				(field) => !(field in firstRecord),
			);
			if (missingFields.length > 0) {
				throw new Error(`Missing fields: ${missingFields.join(", ")}`);
			}
		})
	)
		passed++;
	else failed++;

	// Test 6: CORS headers present for allowed origins
	if (
		await test("CORS headers present for allowed origins", async () => {
			const response = await fetch(`${BASE_URL}/api/vinyls`, {
				headers: { Origin: "http://localhost:3000" },
			});
			const corsHeader = response.headers.get("access-control-allow-origin");
			if (corsHeader !== "http://localhost:3000") {
				throw new Error(
					`Expected CORS header 'http://localhost:3000', got: ${corsHeader}`,
				);
			}
		})
	)
		passed++;
	else failed++;

	// Test 6b: CORS headers blocked for non-allowed origins
	if (
		await test("CORS headers blocked for non-allowed origins", async () => {
			const response = await fetch(`${BASE_URL}/api/vinyls`, {
				headers: { Origin: "http://example.com" },
			});
			const corsHeader = response.headers.get("access-control-allow-origin");
			if (corsHeader) {
				throw new Error(
					`CORS should not allow http://example.com, but got: ${corsHeader}`,
				);
			}
		})
	)
		passed++;
	else failed++;

	// Test 7: Compression enabled
	if (
		await test("Gzip compression is enabled", async () => {
			const response = await fetch(`${BASE_URL}/api/vinyls`, {
				headers: { "Accept-Encoding": "gzip, deflate" },
			});
			const encoding = response.headers.get("content-encoding");
			if (encoding !== "gzip") {
				throw new Error(`Expected gzip encoding, got: ${encoding || "none"}`);
			}
		})
	)
		passed++;
	else failed++;

	// Test 8: Response time
	if (
		await test("Response time < 500ms", async () => {
			const start = Date.now();
			await fetch(`${BASE_URL}/api/vinyls`);
			const duration = Date.now() - start;
			if (duration > 500) {
				throw new Error(`Response took ${duration}ms (threshold: 500ms)`);
			}
		})
	)
		passed++;
	else failed++;

	// Summary
	console.log("\n" + "=".repeat(50));
	console.log(
		`${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`,
	);
	console.log("=".repeat(50) + "\n");

	process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
	console.error(`${colors.red}Test runner failed:${colors.reset}`, error);
	process.exit(1);
});
