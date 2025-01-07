import dotenv from "dotenv";
import { sendStatsLinkEmail } from "../utils/email";

// Load environment variables
dotenv.config();

/*
SQL Query to get recipients with 100+ visits as JSON:

SELECT json_agg(
  json_build_object(
    'email', email,
    'firstName', first_name,
    'clientId', punchpass_id,
    'studioId', 'vibe'
  )
) as recipients
FROM (
  SELECT 
    m.email,
    m.first_name,
    m.punchpass_id,
    mm.attended_classes
  FROM member_metrics mm
  JOIN members m ON m.id = mm.member_id
  WHERE 
    m.email IS NOT NULL 
    AND m.email != ''
    AND mm.attended_classes >= 10
    AND m.email NOT IN ('example@email.com')
  ORDER BY mm.attended_classes DESC
) subquery;

-- This will output a single JSON array that you can copy directly into the recipients array below
*/

// List of recipients with their stats URLs
const recipients = [
  {
    email: "example@gmail.com",
    firstName: "David",
    clientId: "999999",
    studioId: "vibe",
  },
];

async function sendBulkEmails() {
  console.log(`Starting to send ${recipients.length} emails...`);

  for (const recipient of recipients) {
    if (!recipient) {
      continue;
    }

    try {
      console.log(`Sending email to ${recipient.email}...`);
      await sendStatsLinkEmail(recipient);
      console.log(`Successfully sent email to ${recipient.email}`);

      // Add a delay between emails to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      // Continue with next recipient even if one fails
      continue;
    }
  }

  console.log("Finished sending all emails!");
}

// Run the script
if (require.main === module) {
  sendBulkEmails().catch(console.error);
}
