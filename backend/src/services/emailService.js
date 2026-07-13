// Transactional email for lead capture.
//
// Two things TBSBV's version gets wrong and this one doesn't:
//
//  1. It interpolates user input straight into HTML (`<td>${message}</td>`), so a
//     lead whose message contains markup injects it into the inbox of whoever reads
//     the notification. Everything here goes through escapeHtml().
//  2. The From address is hardcoded to SMTP_USER, so mail always appears to come
//     from the mailbox that authenticated. Here it's MAIL_FROM, which lets us
//     authenticate as the TBSBV Workspace account while sending as
//     contact@cyberclaims.net — a confirmation from an unfamiliar domain is
//     friction we can't afford when writing to someone who was just scammed.

import nodemailer from 'nodemailer';
import { env, emailEnabled } from '../config/env.js';

const transporter = emailEnabled
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // implicit TLS on 465, STARTTLS otherwise
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

if (!transporter) {
  console.warn(
    'SMTP not configured — emails are disabled. Leads will still be saved to the database.'
  );
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);

const from = () => `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM || env.SMTP_USER}>`;

const SOURCE_LABEL = {
  hero: 'Homepage hero form',
  contact: 'Contact page',
  start_process: 'Start Process wizard',
  url_checker: 'URL Checker',
};

function row(label, value) {
  if (value === null || value === undefined || value === '') return '';
  return `<tr>
    <td style="padding:6px 14px;font-weight:600;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:6px 14px;vertical-align:top;">${escapeHtml(value).replace(/\n/g, '<br/>')}</td>
  </tr>`;
}

/** Internal alert. Failure here must never fail the request — the lead is already saved. */
export async function sendLeadNotification(lead, leadId) {
  if (!transporter) return;

  await transporter.sendMail({
    from: from(),
    to: env.NOTIFICATION_EMAIL,
    replyTo: lead.email,
    subject: `New lead #${leadId} — ${lead.full_name} (${SOURCE_LABEL[lead.source] ?? lead.source})`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;">
        <h2 style="color:#6b3fa0;margin:0 0 4px;">New lead #${leadId}</h2>
        <p style="margin:0 0 18px;color:#64748b;font-size:13px;">
          ${escapeHtml(SOURCE_LABEL[lead.source] ?? lead.source)}
        </p>
        <table style="border-collapse:collapse;font-size:14px;">
          ${row('Name', lead.full_name)}
          ${row('Email', lead.email)}
          ${row('Phone', lead.phone)}
          ${row('Country', lead.country)}
          ${row('Amount lost', lead.amount)}
          ${row('Platform', lead.platform_name)}
          ${row('Platform site', lead.platform_website)}
          ${row('First transaction', lead.first_transaction)}
          ${row('Last transaction', lead.last_transaction)}
          ${row('Message', lead.message)}
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0;" />
        <p style="font-size:12px;color:#94a3b8;margin:0;">
          IP ${escapeHtml(lead.ip_address ?? '-')} &bull; ${escapeHtml(lead.user_agent ?? '-')}
        </p>
      </div>
    `,
  });
}

/**
 * Newsletter double opt-in. Until this link is clicked the address is `pending` and
 * must not be mailed anything else — that's what makes the subscription lawful.
 */
export async function sendNewsletterConfirmation({ email, token }) {
  if (!transporter) return;

  const url = `${env.SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: from(),
    to: email,
    subject: 'Confirm your subscription — Cyberclaims',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e;">
        <h2 style="color:#6b3fa0;margin:0 0 16px;">One more step</h2>
        <p style="font-size:15px;line-height:1.65;">
          Click below to confirm you want our updates on crypto fraud, recovery and
          investigations. If you didn't ask for this, ignore this email — nothing
          will be sent.
        </p>
        <p style="margin:28px 0;">
          <a href="${escapeHtml(url)}"
             style="display:inline-block;padding:12px 24px;border-radius:8px;background:#6b3fa0;color:#fff;text-decoration:none;font-weight:600;">
            Confirm subscription
          </a>
        </p>
        <p style="font-size:12px;color:#94a3b8;line-height:1.6;">
          Cyberclaims &mdash; Transparent Business Solutions B.V., The Hague
        </p>
      </div>
    `,
  });
}

/** Confirmation to the person who submitted. */
export async function sendLeadConfirmation({ full_name, email }) {
  if (!transporter) return;

  await transporter.sendMail({
    from: from(),
    to: email,
    subject: 'We received your request — Cyberclaims',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e;">
        <h2 style="color:#6b3fa0;margin:0 0 16px;">Thank you, ${escapeHtml(full_name)}.</h2>
        <p style="font-size:15px;line-height:1.65;">
          We have received your case details. A certified investigator will review them
          and get back to you within <strong>48 hours</strong>.
        </p>
        <p style="font-size:15px;line-height:1.65;">
          Everything you sent us is confidential.
        </p>
        <p style="font-size:15px;line-height:1.65;">
          If your matter is urgent, reach us directly at
          <a href="mailto:contact@cyberclaims.net" style="color:#6b3fa0;">contact@cyberclaims.net</a>.
        </p>
        <div style="background:#f2ecf9;border-left:3px solid #6b3fa0;padding:12px 16px;margin:24px 0;font-size:13px;line-height:1.6;">
          <strong>Beware of impersonators.</strong> We will never ask you to send
          cryptocurrency or pay an upfront "release fee" to recover your funds.
          Anyone who does is not us.
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;">
          Cyberclaims &mdash; Transparent Business Solutions B.V.<br/>
          Kalvermarkt 53, 2511 CB, The Hague, Netherlands<br/>
          Dutch Ministry of Justice &bull; POB 07373
        </p>
      </div>
    `,
  });
}
