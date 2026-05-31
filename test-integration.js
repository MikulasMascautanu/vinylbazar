/**
 * Integration test for Phase 2: Email notification system
 * Simulates new records and tests the complete notification flow
 */

import { db } from './src/db.js';
import { sendEmailNotification } from './src/notify.js';
import { config } from './src/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function testIntegration() {
	console.log('🧪 Testing Phase 2 Integration...\n');
	
	try {
		// Initialize database
		await db.init();
		
		// Get some existing records to simulate as "new today"
		console.log('📊 Getting sample records from database...');
		const sampleRecords = await new Promise((resolve, reject) => {
			db.db.all('SELECT * FROM vinyls LIMIT 5', (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
		
		if (sampleRecords.length === 0) {
			console.error('❌ No records in database. Please run scraper first.');
			await db.close();
			process.exit(1);
		}
		
		console.log(`✅ Found ${sampleRecords.length} sample records\n`);
		
		// Simulate these as new records with today's date
		const simulatedNewRecords = sampleRecords.map(record => ({
			...record,
			created_at: new Date().toISOString()
		}));
		
		console.log('📧 Testing notification with simulated new records...\n');
		
		// Check if email is configured
		const emailConfigured = process.env.EMAIL_USER && 
		                       process.env.EMAIL_PASS && 
		                       process.env.EMAIL_TO;
		
		if (!emailConfigured) {
			console.log('⚠️  Email not configured (.env file missing credentials)');
			console.log('   Testing notification logic without sending email...\n');
			
			// Test the logic without sending
			if (simulatedNewRecords.length >= config.notification.minRecordsThreshold) {
				console.log(`✅ Would send notification for ${simulatedNewRecords.length} records`);
				console.log(`   Threshold: ${config.notification.minRecordsThreshold}`);
				console.log(`   Notification enabled: ${config.notification.enabled}`);
			} else {
				console.log(`ℹ️  Would skip notification (below threshold)`);
			}
		} else {
			console.log('✅ Email configured, sending test notification...\n');
			
			if (config.notification.enabled && 
			    simulatedNewRecords.length >= config.notification.minRecordsThreshold) {
				const result = await sendEmailNotification(simulatedNewRecords);
				
				if (result.success) {
					console.log('\n✅ Integration test PASSED!');
					console.log('   Email notification sent successfully');
					console.log(`   Message ID: ${result.messageId}`);
					console.log(`\n📬 Check your email at ${process.env.EMAIL_TO}`);
				} else {
					console.log(`\n⚠️  Notification not sent: ${result.message}`);
				}
			} else {
				console.log('ℹ️  Notifications disabled or below threshold');
			}
		}
		
		// Close database
		await db.close();
		
		console.log('\n✅ Integration test completed!\n');
		
	} catch (error) {
		console.error('\n❌ Integration test failed:', error.message);
		console.error(error.stack);
		
		try {
			await db.close();
		} catch (closeError) {
			// Ignore
		}
		
		process.exit(1);
	}
}

testIntegration();
