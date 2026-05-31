/**
 * Email notification module for sending alerts about new vinyl records
 * Uses nodemailer with Gmail SMTP
 */

import nodemailer from "nodemailer";

/**
 * Create email transporter using Gmail SMTP
 */
function createTransporter() {
	const emailUser = process.env.EMAIL_USER;
	const emailPass = process.env.EMAIL_PASS;

	if (!emailUser || !emailPass) {
		throw new Error(
			"EMAIL_USER and EMAIL_PASS environment variables are required",
		);
	}

	return nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: emailUser,
			pass: emailPass,
		},
	});
}

/**
 * Generate HTML email template for new vinyl records
 * @param {Array} records - Array of new vinyl records
 * @returns {string} HTML content
 */
function generateEmailHTML(records) {
	const date = new Date().toLocaleDateString("cs-CZ", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const recordsHTML = records
		.map(
			(record, index) => `
		<div style="border-bottom: 1px solid #e0e0e0; padding: 15px 0; margin-bottom: 15px;">
			<div style="display: flex; align-items: flex-start; gap: 15px;">
				${
					record.image_url
						? `
					<img src="${record.image_url}" alt="${record.title}" 
						style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
				`
						: ""
				}
				<div style="flex: 1;">
					<h3 style="margin: 0 0 5px 0; color: #1a1a1a; font-size: 16px;">
						${index + 1}. 🆕 ${record.title}
					</h3>
					${
						record.artist
							? `
						<p style="margin: 5px 0; color: #555; font-size: 14px;">
							<strong>Artist:</strong> ${record.artist}
						</p>
					`
							: ""
					}
					${
						record.category
							? `
						<p style="margin: 5px 0; color: #666; font-size: 13px;">
							<strong>Category:</strong> ${record.category}
						</p>
					`
							: ""
					}
					${
						record.price
							? `
						<p style="margin: 5px 0; color: #2c7a2c; font-size: 15px; font-weight: bold;">
							${record.price} Kč
						</p>
					`
							: ""
					}
					${
						record.product_url
							? `
						<p style="margin: 10px 0 0 0;">
							<a href="${record.product_url}" 
								style="background: #4CAF50; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px; font-size: 13px;">
								View Record
							</a>
						</p>
					`
							: ""
					}
				</div>
			</div>
		</div>
	`,
		)
		.join("");

	const frontendUrl = process.env.FRONTEND_URL || "https://www.vinylbazar.net";

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
			<div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
				<h1 style="color: #4CAF50; margin-top: 0; border-bottom: 3px solid #4CAF50; padding-bottom: 10px;">
					🎵 New Vinyl Records Alert!
				</h1>
				<p style="font-size: 16px; color: #555; margin-bottom: 20px;">
					<strong>${date}</strong>
				</p>
				<p style="font-size: 18px; color: #1a1a1a; margin-bottom: 25px;">
					Found <strong>${records.length}</strong> new vinyl record${records.length !== 1 ? "s" : ""} today:
				</p>
				
				<div style="margin-bottom: 30px;">
					${recordsHTML}
				</div>
				
				<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
					<a href="${frontendUrl}" 
						style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
						View All Records
					</a>
				</div>
				
				<p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
					This is an automated notification from Vinyl Bazar Scraper
				</p>
			</div>
		</body>
		</html>
	`;
}

/**
 * Send email notification with new vinyl records
 * @param {Array} records - Array of new vinyl records
 * @returns {Promise<object>} Email send result
 */
export async function sendEmailNotification(records) {
	if (!records || records.length === 0) {
		console.log("📧 No new records to notify about");
		return { success: false, message: "No records provided" };
	}

	try {
		const transporter = createTransporter();

		const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
		const emailTo = process.env.EMAIL_TO;

		if (!emailTo) {
			throw new Error("EMAIL_TO environment variable is required");
		}

		const date = new Date().toLocaleDateString("cs-CZ");
		const subject = `🎵 New Vinyl Records Found - ${date}`;
		const html = generateEmailHTML(records);

		const mailOptions = {
			from: `"Vinyl Bazar Scraper" <${emailFrom}>`,
			to: emailTo,
			subject: subject,
			html: html,
		};

		const info = await transporter.sendMail(mailOptions);

		console.log(
			`✅ Email notification sent successfully! Message ID: ${info.messageId}`,
		);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("❌ Failed to send email notification:", error.message);
		throw error;
	}
}
