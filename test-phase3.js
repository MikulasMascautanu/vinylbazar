/**
 * Test Phase 3: GitHub Actions Integration
 *
 * Verifies that:
 * 1. GitHub Actions workflow file exists and is valid
 * 2. Workflow includes required environment variables
 * 3. .gitignore excludes .env file
 * 4. README.md documents GitHub Secrets setup
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 Testing Phase 3: GitHub Actions Integration\n");

let passed = 0;
let failed = 0;

function test(description, fn) {
	try {
		fn();
		console.log(`✅ ${description}`);
		passed++;
	} catch (error) {
		console.log(`❌ ${description}`);
		console.log(`   Error: ${error.message}`);
		failed++;
	}
}

// Test 1: Workflow file exists
test("GitHub Actions workflow file exists", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	if (!fs.existsSync(workflowPath)) {
		throw new Error("Workflow file not found at .github/workflows/scraper.yml");
	}
});

// Test 2: Workflow contains email environment variables
test("Workflow includes EMAIL_USER environment variable", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf-8");
	if (!content.includes("EMAIL_USER: ${{ secrets.EMAIL_USER }}")) {
		throw new Error("EMAIL_USER environment variable not found in workflow");
	}
});

test("Workflow includes EMAIL_PASS environment variable", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf-8");
	if (!content.includes("EMAIL_PASS: ${{ secrets.EMAIL_PASS }}")) {
		throw new Error("EMAIL_PASS environment variable not found in workflow");
	}
});

test("Workflow includes EMAIL_FROM environment variable", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf-8");
	if (!content.includes("EMAIL_FROM: ${{ secrets.EMAIL_FROM }}")) {
		throw new Error("EMAIL_FROM environment variable not found in workflow");
	}
});

test("Workflow includes EMAIL_TO environment variable", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf-8");
	if (!content.includes("EMAIL_TO: ${{ secrets.EMAIL_TO }}")) {
		throw new Error("EMAIL_TO environment variable not found in workflow");
	}
});

test("Workflow includes optional FRONTEND_URL environment variable", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf-8");
	if (!content.includes("FRONTEND_URL: ${{ secrets.FRONTEND_URL }}")) {
		throw new Error("FRONTEND_URL environment variable not found in workflow");
	}
});

// Test 3: .gitignore excludes .env
test(".gitignore excludes .env file", () => {
	const gitignorePath = path.join(__dirname, ".gitignore");
	const content = fs.readFileSync(gitignorePath, "utf-8");
	if (!content.includes(".env")) {
		throw new Error(".env not found in .gitignore");
	}
});

// Test 4: README documents GitHub Secrets
test("README.md documents GitHub Secrets setup", () => {
	const readmePath = path.join(__dirname, "README.md");
	const content = fs.readFileSync(readmePath, "utf-8");
	if (!content.includes("GitHub Secrets")) {
		throw new Error("GitHub Secrets documentation not found in README.md");
	}
});

test("README.md includes EMAIL_USER secret", () => {
	const readmePath = path.join(__dirname, "README.md");
	const content = fs.readFileSync(readmePath, "utf-8");
	if (!content.includes("EMAIL_USER")) {
		throw new Error("EMAIL_USER not documented in README.md");
	}
});

test("README.md includes EMAIL_PASS secret", () => {
	const readmePath = path.join(__dirname, "README.md");
	const content = fs.readFileSync(readmePath, "utf-8");
	if (!content.includes("EMAIL_PASS")) {
		throw new Error("EMAIL_PASS not documented in README.md");
	}
});

test("README.md includes Gmail app password instructions", () => {
	const readmePath = path.join(__dirname, "README.md");
	const content = fs.readFileSync(readmePath, "utf-8");
	if (!content.includes("Gmail") && !content.includes("app password")) {
		throw new Error("Gmail app password instructions not found in README.md");
	}
});

test("README.md includes workflow testing instructions", () => {
	const readmePath = path.join(__dirname, "README.md");
	const content = fs.readFileSync(readmePath, "utf-8");
	if (!content.includes("Run workflow") || !content.includes("Actions")) {
		throw new Error("Workflow testing instructions not found in README.md");
	}
});

// Test 5: Workflow has proper structure
test("Workflow uses secrets correctly", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf-8");
	// Check that secrets are referenced with ${{ secrets.* }} syntax
	const secretPattern = /\$\{\{\s*secrets\.\w+\s*\}\}/g;
	const matches = content.match(secretPattern);
	if (!matches || matches.length < 4) {
		throw new Error("Workflow does not properly reference GitHub secrets");
	}
});

test("Workflow includes Run scraper step", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf-8");
	if (!content.includes("Run scraper")) {
		throw new Error("Run scraper step not found in workflow");
	}
});

// Summary
console.log("\n" + "=".repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log("=".repeat(50));

if (failed > 0) {
	console.log("\n❌ Some tests failed. Please fix the issues above.");
	process.exit(1);
} else {
	console.log("\n✅ All tests passed! Phase 3 implementation is ready.");
	process.exit(0);
}
