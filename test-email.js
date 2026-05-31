/**
 * Test script for email notifications
 * Run with: node test-email.js
 *
 * Make sure to create a .env file with your email credentials first!
 */

import { sendEmailNotification } from "./src/notify.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Mock vinyl records data for testing
// Using REAL records from the database so images and links work correctly
const mockRecords = [
	{
		id: 1,
		title: "Something Wonderful (LP)",
		artist: "Nancy Wilson",
		category: "Jazz, Blues - USA, UK",
		price: 459,
		image_url:
			"https://www.vinylbazar.net/fotky30077/fotos/_vyr_20666batch_IMG_0032.jpg",
		product_url:
			"https://www.vinylbazar.net/vinylmarket/eshop/13-1-Jazz-Blues-USA-UK/0/5/20666-LP-Nancy-Wilson-Something-Wonderful",
		created_at: new Date().toISOString(),
	},
	{
		id: 2,
		title: "Eastern Sounds (LP)",
		artist: "Yusef Lateef",
		category: "Jazz, Blues - USA, UK",
		price: 979,
		image_url:
			"https://www.vinylbazar.net/fotky30077/fotos/_vyr_20665batch_IMG_0038.jpg",
		product_url:
			"https://www.vinylbazar.net/vinylmarket/eshop/13-1-Jazz-Blues-USA-UK/0/5/20665-LP-Yusef-Lateef-Eastern-Sounds",
		created_at: new Date().toISOString(),
	},
	{
		id: 3,
		title: "Visions Of A New World (LP)",
		artist: "Lonnie Liston Smith & The Cosmic Echoes",
		category: "Soul, Funk, Disco, R&B",
		price: 1399,
		image_url:
			"https://www.vinylbazar.net/fotky30077/fotos/_vyr_20663batch_IMG_0042.jpg",
		product_url:
			"https://www.vinylbazar.net/vinylmarket/eshop/7-1-Soul-Funk-Disco-R-B/0/5/20663-LP-Lonnie-Liston-Smith-The-Cosmic-Echoes-Visions-Of-A-New-World",
		created_at: new Date().toISOString(),
	},
	{
		id: 4,
		title: "Expansions (LP)",
		artist: "Lonnie Liston Smith & The Cosmic Echoes",
		category: "Soul, Funk, Disco, R&B",
		price: 849,
		image_url:
			"https://www.vinylbazar.net/fotky30077/fotos/_vyr_20664batch_IMG_0027.jpg",
		product_url:
			"https://www.vinylbazar.net/vinylmarket/eshop/7-1-Soul-Funk-Disco-R-B/0/5/20664-LP-Lonnie-Liston-Smith-The-Cosmic-Echoes-Expansions",
		created_at: new Date().toISOString(),
	},
	{
		id: 5,
		title: "Jazz Kolem Karla Krautgartnera (LP)",
		artist: "Karel Krautgartner, Jazz. Orch. Čs Rozhlasu",
		category: "Jazz, Blues - CZ, SK, PL",
		price: 599,
		image_url:
			"https://www.vinylbazar.net/fotky30077/fotos/_vyr_20661batch_IMG_0051.jpg",
		product_url:
			"https://www.vinylbazar.net/vinylmarket/eshop/24-1-Jazz-Blues-CZ-SK-PL/0/5/20661-LP-Karel-Krautgartner-Jazz-Orch-Cs-Rozhlasu-Jazz-Kolem-Karla-Krautgartnera",
		created_at: new Date().toISOString(),
	},
];

async function testEmailNotification() {
	console.log("🧪 Testing email notification...\n");

	// Check if required environment variables are set
	const requiredVars = ["EMAIL_USER", "EMAIL_PASS", "EMAIL_TO"];
	const missingVars = requiredVars.filter((varName) => !process.env[varName]);

	if (missingVars.length > 0) {
		console.error(
			"❌ Missing required environment variables:",
			missingVars.join(", "),
		);
		console.error(
			"\n📝 Please create a .env file based on .env.example and fill in your credentials.",
		);
		console.error("\nSteps to set up Gmail app password:");
		console.error("1. Go to https://myaccount.google.com/apppasswords");
		console.error("2. Enable 2-Step Verification if not already enabled");
		console.error("3. Generate a new app password");
		console.error(
			"4. Use that password in EMAIL_PASS (not your regular Gmail password)\n",
		);
		process.exit(1);
	}

	console.log(`📧 Sending test email to: ${process.env.EMAIL_TO}`);
	console.log(`📤 Using sender: ${process.env.EMAIL_USER}`);
	console.log(`📦 Mock records: ${mockRecords.length}\n`);

	try {
		const result = await sendEmailNotification(mockRecords);

		if (result.success) {
			console.log("\n✅ TEST PASSED! Email sent successfully!");
			console.log(`📬 Check your inbox at ${process.env.EMAIL_TO}`);
			console.log("💡 If you don't see it, check your spam folder.\n");
		} else {
			console.log("\n⚠️  Email not sent:", result.message);
		}
	} catch (error) {
		console.error("\n❌ TEST FAILED! Error sending email:");
		console.error(error.message);
		console.error("\n💡 Common issues:");
		console.error(
			"- Make sure you're using a Gmail App Password, not your regular password",
		);
		console.error(
			"- Check that 2-Step Verification is enabled on your Google account",
		);
		console.error("- Verify EMAIL_USER and EMAIL_TO are valid email addresses");
		console.error("- Check your internet connection\n");
		process.exit(1);
	}
}

testEmailNotification();
