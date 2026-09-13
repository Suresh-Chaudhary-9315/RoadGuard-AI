import { NotificationModel, EmailNotificationDoc } from '../../database/models/notificationModel';
import { PotholeReportDoc } from '../../database/models/reportModel';

interface SendEmailParams {
  report: PotholeReportDoc;
  recipientEmail?: string;
}

export async function sendAuthorityAlertEmail({
  report,
  recipientEmail,
}: SendEmailParams): Promise<EmailNotificationDoc> {
  const authorityEmail =
    recipientEmail ||
    process.env.AUTHORITY_ALERT_EMAIL ||
    'authority@nhai.gov.in';

  const fromAddress =
    process.env.RESEND_FROM || 'Terra Scan AI <onboarding@resend.dev>';

  const subject = `[UTSENT ROAD HAZARD] ${report.severity.toUpperCase()} Pothole Detected on ${report.location.roadName} (#${report.id})`;

  const timestamp = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const severityColor =
    report.severity === 'severe'
      ? '#dc2626'
      : report.severity === 'moderate'
      ? '#d97706'
      : '#16a34a';

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 20px 24px; border-bottom: 3px solid ${severityColor}; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: ${severityColor}; color: #ffffff; }
          .content { padding: 24px; }
          .field-group { margin-bottom: 16px; }
          .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .field-val { font-size: 14px; font-weight: 600; color: #0f172a; }
          .gps-card { background: #f1f5f9; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #cbd5e1; }
          .image-preview { width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-top: 12px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; }
          .cta-btn { display: inline-block; background: #1d4ed8; color: #ffffff; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="margin: 0; font-size: 18px; font-weight: 800;">Terra Scan AI — Hazard Alert</h2>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Smart India Hackathon Highway Safety Dispatch</div>
              </div>
              <span class="badge">${report.severity}</span>
            </div>
          </div>

          <div class="content">
            <p style="font-size: 14px; line-height: 1.5; margin-top: 0;">
              A road hazard report has been logged in Terra Scan AI and is ready for authority review.
            </p>

            <div class="field-group">
              <div class="field-label">Report Reference</div>
              <div class="field-val" style="font-family: monospace;">${report.id}</div>
            </div>

            <div class="field-group">
              <div class="field-label">Road Corridor</div>
              <div class="field-val">${report.location.roadName}</div>
            </div>

            <div class="gps-card">
              <div class="field-label">Geo-Tagged Location & Coordinates</div>
              <div style="font-size: 13px; font-weight: 500; color: #334155;">${report.location.address}</div>
              <div style="font-family: monospace; font-size: 12px; color: #2563eb; margin-top: 4px;">
                Latitude: ${report.location.lat.toFixed(6)} | Longitude: ${report.location.lng.toFixed(6)}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div class="field-label">AI Confidence</div>
                <div style="font-size: 18px; font-weight: 800; color: #1d4ed8;">${report.confidenceScore}%</div>
              </div>
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div class="field-label">Severity</div>
                <div style="font-size: 18px; font-weight: 800; color: ${severityColor}; text-transform: capitalize;">${report.severity}</div>
              </div>
            </div>

            ${
              report.imageUrl
                ? `<div class="field-group">
                    <div class="field-label">Surface Damage Photo</div>
                    <img src="${report.imageUrl}" alt="Pothole Damage" class="image-preview" />
                  </div>`
                : ''
            }

            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="cta-btn">
                Open Authority Console
              </a>
            </div>
          </div>

          <div class="footer">
            Automated Terra Scan AI alert prepared for ${authorityEmail} at ${timestamp}
          </div>
        </div>
      </body>
    </html>
  `;

  let deliveryStatus: 'sent' | 'simulated' = 'simulated';

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `roadguard-report-${report.id}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [authorityEmail],
          subject,
          html: bodyHtml,
        }),
        signal: controller.signal,
      });

      const responseBody = await response.text();

      if (!response.ok) {
        console.warn(
          `[Email Service] Resend API failed (${response.status}): ${responseBody}`
        );
      } else {
        deliveryStatus = 'sent';
        console.log(
          `[Email Service] Resend accepted email for ${authorityEmail}: ${responseBody}`
        );
      }
    } catch (err: any) {
      console.warn(
        `[Email Service] Resend request failed: ${err?.message || String(err)}`
      );
    } finally {
      clearTimeout(timeout);
    }
  } else {
    console.warn(
      '[Email Service] RESEND_API_KEY is not configured. Email logged as simulated.'
    );
  }

  const notificationRecord: EmailNotificationDoc = {
    id: `EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    reportId: report.id,
    to: authorityEmail,
    from: fromAddress,
    subject,
    severity: report.severity,
    roadName: report.location.roadName,
    locationDetails: report.location.address,
    coordinates: { lat: report.location.lat, lng: report.location.lng },
    confidenceScore: report.confidenceScore,
    sentAt: timestamp,
    status: deliveryStatus,
    bodyHtml,
  };

  await NotificationModel.logEmail(notificationRecord);
  return notificationRecord;
}
