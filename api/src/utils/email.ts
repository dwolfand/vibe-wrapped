import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getStudioShortName } from "./studios";

const baseUrl = "https://wrapped.thevibestudiolynchburg.com";

interface StatsLinkEmailData {
  email: string;
  firstName: string;
  clientId: string;
  studioId: string;
}

interface NotificationRequestData {
  email: string;
  firstName: string;
  lastName: string;
  studio: string;
  isCustomStudio: boolean;
}

const ses = new SESClient({ region: "us-east-1" });

export async function sendAdminNotification({
  email,
  firstName,
  lastName,
  studio,
  isCustomStudio,
}: NotificationRequestData) {
  const studioShortName = !isCustomStudio
    ? getStudioShortName(studio)
    : undefined;
  const studioDisplay = isCustomStudio
    ? `${studio} (Custom)`
    : `${studio} (${studioShortName || "Unknown"})`;

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_CC_EMAIL) {
    throw new Error("ADMIN_EMAIL and ADMIN_CC_EMAIL are required");
  }

  const command = new SendEmailCommand({
    Source: "Vibe Wrapped <no-reply@madwrapped.com>",
    Destination: {
      ToAddresses: [process.env.ADMIN_EMAIL!],
      CcAddresses: [process.env.ADMIN_CC_EMAIL!],
    },
    Message: {
      Subject: {
        Data: "New Vibe Wrapped Notification Request",
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0;">
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <h1 style="margin: 0 0 20px 0;">New Notification Request</h1>
                  <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 20px 0 0 0;">Please pull their data when ready.</p>
                </div>
              </body>
            </html>
          `,
        },
      },
    },
  });

  try {
    await ses.send(command);
    return true;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    // Don't throw the error as this is a background notification
    return false;
  }
}

export async function sendStatsLinkEmail({
  email,
  firstName,
  clientId,
  studioId,
}: StatsLinkEmailData) {
  const statsUrl = `${baseUrl}/?clientId=${clientId}&studioId=vibe`;

  const command = new SendEmailCommand({
    Source: "Vibe Wrapped <no-reply@madwrapped.com>",
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [process.env.ADMIN_CC_EMAIL!],
    Message: {
      Subject: {
        Data: "Your Vibe Wrapped Stats Are Ready! 🎉",
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0;">
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="text-align: center; padding: 20px;">
                    <img src="${baseUrl}/images/email/logo.jpg" 
                         alt="The Vibe Studio" 
                         style="width: 200px; height: auto;" />
                  </div>
                  <div style="padding: 40px 20px;">
                    <h1 style="margin: 0 0 20px 0;">Hi ${firstName}! 👋</h1>
                    <p style="margin: 0 0 20px 0;">Your Vibe Studio Wrapped stats are ready to view!</p>
                    <p style="margin: 0 0 30px 0; font-weight: bold;">Unwrap your year of Vibes:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${statsUrl}" 
                         style="background-color: #00ffff; color: #000000; padding: 12px 24px; 
                                text-decoration: none; border-radius: 5px; font-weight: bold; 
                                display: inline-block; border: 2px solid #000000;
                                text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);">
                        View My Year in Review
                      </a>
                    </div>
                    <p style="margin: 20px 0 10px 0;">Or copy and paste this link into your browser:</p>
                    <p style="margin: 0 0 30px 0; color: #00ffff;">${statsUrl}</p>
                    <p style="margin: 0;">You've crushed it this year! Celebrate your progress and let's make 2025 even more epic!</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        },
      },
    },
  });

  try {
    await ses.send(command);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
