/**
 * Phase 5 Automated Tests
 * Tests GitHub Actions workflow configuration and related files
 */

const fs = require("fs");
const path = require("path");

console.log("🧪 Phase 5: GitHub Actions Automation - Automated Tests\n");

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(description, fn) {
	testsRun++;
	try {
		fn();
		testsPassed++;
		console.log(`✅ ${description}`);
	} catch (error) {
		testsFailed++;
		console.log(`❌ ${description}`);
		console.log(`   Error: ${error.message}`);
	}
}

// Test 1: Workflow file exists
test("Workflow file exists at .github/workflows/scraper.yml", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	if (!fs.existsSync(workflowPath)) {
		throw new Error("Workflow file not found");
	}
});

// Test 2: Workflow file is readable
test("Workflow file is readable and not empty", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (content.length === 0) {
		throw new Error("Workflow file is empty");
	}
});

// Test 3: Workflow contains cron schedule
test("Workflow contains cron schedule (4 AM daily)", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (!content.includes("0 4 * * *")) {
		throw new Error("Cron schedule for 4 AM daily not found");
	}
});

// Test 4: Workflow contains workflow_dispatch trigger
test("Workflow contains manual dispatch trigger", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (!content.includes("workflow_dispatch")) {
		throw new Error("workflow_dispatch trigger not found");
	}
});

// Test 5: Workflow uses actions/checkout@v4
test("Workflow uses actions/checkout@v4", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (!content.includes("actions/checkout@v4")) {
		throw new Error("actions/checkout@v4 not found");
	}
});

// Test 6: Workflow uses actions/setup-node@v4
test("Workflow uses actions/setup-node@v4", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (!content.includes("actions/setup-node@v4")) {
		throw new Error("actions/setup-node@v4 not found");
	}
});

// Test 7: Workflow runs npm ci
test("Workflow runs npm ci to install dependencies", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (!content.includes("npm ci")) {
		throw new Error("npm ci command not found");
	}
});

// Test 8: Workflow runs scraper
test("Workflow runs npm run scrape", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (!content.includes("npm run scrape")) {
		throw new Error("npm run scrape command not found");
	}
});

// Test 9: Workflow configures git
test("Workflow configures git user.name and user.email", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (
		!content.includes("git config user.name") ||
		!content.includes("git config user.email")
	) {
		throw new Error("Git configuration commands not found");
	}
});

// Test 10: Workflow commits and pushes changes
test("Workflow commits and pushes database changes", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (
		!content.includes("git add data/vinyls.db") ||
		!content.includes("git push")
	) {
		throw new Error("Git commit/push commands not found");
	}
});

// Test 11: Workflow has conditional commit
test("Workflow only commits if database changed", () => {
	const workflowPath = path.join(__dirname, ".github/workflows/scraper.yml");
	const content = fs.readFileSync(workflowPath, "utf8");
	if (!content.includes("git diff --staged --quiet")) {
		throw new Error("Conditional commit check not found");
	}
});

// Test 12: .gitignore allows database commits
test(".gitignore allows database file commits", () => {
	const gitignorePath = path.join(__dirname, ".gitignore");
	const content = fs.readFileSync(gitignorePath, "utf8");
	// Should NOT have uncommented data/*.db line
	const lines = content
		.split("\n")
		.filter((line) => !line.trim().startsWith("#"));
	const hasDbExclusion = lines.some((line) => line.includes("data/*.db"));
	if (hasDbExclusion) {
		throw new Error(".gitignore still excludes data/*.db");
	}
});

// Test 13: Database file exists
test("Database file exists at data/vinyls.db", () => {
	const dbPath = path.join(__dirname, "data/vinyls.db");
	if (!fs.existsSync(dbPath)) {
		throw new Error("Database file not found");
	}
});

// Test 14: Database file size is reasonable
test("Database file size is reasonable (> 100KB)", () => {
	const dbPath = path.join(__dirname, "data/vinyls.db");
	const stats = fs.statSync(dbPath);
	if (stats.size < 100000) {
		throw new Error(`Database file too small: ${stats.size} bytes`);
	}
});

// Summary
console.log("\n📊 Test Summary:");
console.log(`   Total: ${testsRun}`);
console.log(`   Passed: ${testsPassed} ✅`);
console.log(`   Failed: ${testsFailed} ❌`);

if (testsFailed === 0) {
	console.log("\n🎉 All automated tests passed!");
	process.exit(0);
} else {
	console.log("\n⚠️  Some tests failed. Please review the errors above.");
	process.exit(1);
}
