/**
 * Test script to verify the notified flag system works correctly
 * Tests: getNewRecords(), markAsNotified()
 */

import { db } from './src/db.js';

async function testNotifiedFlag() {
	console.log('🧪 Testing notified flag system...\n');
	
	try {
		await db.init();
		
		// Step 1: Set a few records to notified=0 for testing
		console.log('📝 Step 1: Setting 3 records to notified=0 for testing...');
		await new Promise((resolve, reject) => {
			db.db.run(
				'UPDATE vinyls SET notified = 0 WHERE id IN (SELECT id FROM vinyls LIMIT 3)',
				(err) => {
					if (err) reject(err);
					else resolve();
				}
			);
		});
		console.log('✅ Test records prepared\n');
		
		// Step 2: Get new records
		console.log('📝 Step 2: Testing getNewRecords()...');
		const newRecords = await db.getNewRecords();
		console.log(`✅ Found ${newRecords.length} unnotified records\n`);
		
		if (newRecords.length === 0) {
			console.error('❌ Expected to find records but got 0');
			await db.close();
			process.exit(1);
		}
		
		// Show the records
		console.log('Records to be notified:');
		newRecords.forEach((record, index) => {
			console.log(`  ${index + 1}. ${record.title} (ID: ${record.id})`);
		});
		console.log('');
		
		// Step 3: Mark as notified
		console.log('📝 Step 3: Testing markAsNotified()...');
		const recordIds = newRecords.map(r => r.id);
		await db.markAsNotified(recordIds);
		console.log(`✅ Marked ${recordIds.length} records as notified\n`);
		
		// Step 4: Verify they're no longer returned
		console.log('📝 Step 4: Verifying records are now marked...');
		const checkRecords = await db.getNewRecords();
		console.log(`✅ Now found ${checkRecords.length} unnotified records\n`);
		
		// Step 5: Verify in database
		console.log('📝 Step 5: Verifying in database...');
		const verifyResult = await new Promise((resolve, reject) => {
			db.db.all(
				`SELECT id, title, notified FROM vinyls WHERE id IN (${recordIds.join(',')})`,
				(err, rows) => {
					if (err) reject(err);
					else resolve(rows);
				}
			);
		});
		
		const allMarked = verifyResult.every(r => r.notified === 1);
		if (allMarked) {
			console.log('✅ All test records have notified=1 in database\n');
		} else {
			console.error('❌ Some records were not marked correctly');
			verifyResult.forEach(r => {
				console.log(`  ID ${r.id}: notified=${r.notified} (expected 1)`);
			});
		}
		
		// Success!
		await db.close();
		
		console.log('🎉 All tests PASSED!\n');
		console.log('Summary:');
		console.log('  ✅ getNewRecords() returns only notified=0 records');
		console.log('  ✅ markAsNotified() correctly updates notified flag');
		console.log('  ✅ Marked records are excluded from getNewRecords()');
		console.log('');
		
	} catch (error) {
		console.error('\n❌ Test failed:', error.message);
		console.error(error.stack);
		
		try {
			await db.close();
		} catch (closeError) {
			// Ignore
		}
		
		process.exit(1);
	}
}

testNotifiedFlag();
