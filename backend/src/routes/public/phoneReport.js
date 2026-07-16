// Server-side proxy for the ScamInfo phone-number report.
//
// The whole reason this exists on our server: the ScamInfo API key is a secret and
// must never reach the browser. The landing page POSTs { phone_number, locale }; we
// attach the key, add our white-label branding, call the partner API, and stream the
// PDF straight back. Nothing is stored (the partner API is ephemeral, and we keep it
// that way — no phone number is written to our database, which also keeps this GDPR-
// clean: the sensitive detail lives only in the PDF the user downloads).

import { Router } from 'express';
import { Readable } from 'node:stream';
import { phoneReportSchema } from '../../schemas/phoneReport.schema.js';
import { validate, honeypot } from '../../middleware/validate.js';
import { phoneReportLimiter } from '../../middleware/rateLimiter.js';
import { env } from '../../config/env.js';

const router = Router();

// Live analysis can take ~60–75s, so give it headroom before we give up.
const UPSTREAM_TIMEOUT_MS = 90_000;

// The test gateway (api.test.scaminfo.ai) is fronted by HTTP Basic auth in addition to
// the X-Api-Key. Attach it only for a test host; production (api.scaminfo.ai) doesn't
// use it. Credentials default to the known test pair and can be overridden via env.
function upstreamHeaders() {
  const headers = {
    'X-Api-Key': env.SCAMINFO_API_KEY,
    'Content-Type': 'application/json',
    Accept: 'application/pdf',
  };
  if (/test\.scaminfo\.ai/i.test(env.SCAMINFO_API_URL)) {
    const user = env.SCAMINFO_BASIC_USER || 'test';
    const pass = env.SCAMINFO_BASIC_PASS || 'scaminfo';
    headers.Authorization = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
  }
  return headers;
}

const BRANDING = {
  company_name: 'CyberClaims',
  website: 'cyberclaims.nl',
  tagline: 'Cybercrime victim support & recovery',
  accent_color: '#0EA5A4',
  // A public, real PNG (the site has no logo.png; the favicon is the mark). ScamInfo
  // fetches this to white-label the PDF, so it must be reachable from the internet.
  logo_url: 'https://cyberclaims.nl/favicon-192.png',
};

router.post('/', honeypot, phoneReportLimiter, validate(phoneReportSchema), async (req, res, next) => {
  if (!env.SCAMINFO_API_KEY) {
    return res.status(503).json({
      success: false,
      message: 'The report service is not available right now. Please try again later.',
    });
  }

  const { phone_number, locale } = req.body;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${env.SCAMINFO_API_URL}/public/v1/phone/report.pdf`, {
      method: 'POST',
      headers: upstreamHeaders(),
      body: JSON.stringify({
        phone_number,
        language: locale, // schema constrained this to en|nl|de|it|es|pt|fr
        branding: BRANDING,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      console.error(`phone-report upstream ${upstream.status}: ${detail.slice(0, 300)}`);
      if (upstream.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'The report service is busy right now. Please wait a moment and try again.',
        });
      }
      if (upstream.status === 422 || upstream.status === 400) {
        return res.status(422).json({
          success: false,
          message: "We couldn't read that phone number. Please check it and try again.",
        });
      }
      return res.status(502).json({
        success: false,
        message: "We couldn't generate your report right now. Please try again shortly.",
      });
    }

    // Stream the PDF through untouched. filename gets a sanitised version of the number.
    const safeName = phone_number.replace(/[^\d+]/g, '') || 'number';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cyberclaims-phone-report-${safeName}.pdf"`);
    res.setHeader('Cache-Control', 'no-store');

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'The report took too long to generate. Please try again.',
      });
    }
    // A network error reaching the partner, etc.
    console.error('phone-report proxy error:', err.message);
    return res.status(502).json({
      success: false,
      message: "We couldn't reach the report service. Please try again shortly.",
    });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
