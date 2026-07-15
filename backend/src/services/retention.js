import { Lead } from '../models/Lead.js';
import { env } from '../config/env.js';

// GDPR data retention.
//
// A lead row records how much money someone lost, to which platform, and when. That
// is sensitive personal data about a victim of a crime, and "we kept it because the
// table had room" is not a lawful basis for holding it forever. Article 5(1)(e):
// personal data must be kept no longer than is necessary for the purpose it was
// collected for.
//
// So: leads marked `closed` are deleted once they have been closed for
// LEAD_RETENTION_DAYS. Open leads are never touched - a case still being worked is
// still necessary. The deletion is a real DELETE, not a flag.
//
// Set LEAD_RETENTION_DAYS=0 to disable, but be able to justify that to a regulator.

const DAY_MS = 24 * 60 * 60 * 1000;

export function startRetentionJob() {
  const days = env.LEAD_RETENTION_DAYS;

  if (!days) {
    console.warn(
      'LEAD_RETENTION_DAYS is 0 - closed leads are kept indefinitely. ' +
        'That is a GDPR Article 5(1)(e) exposure, not a feature.'
    );
    return;
  }

  const run = async () => {
    try {
      const deleted = await Lead.purgeClosedOlderThan(days);
      if (deleted > 0) {
        console.log(`Retention: deleted ${deleted} lead(s) closed more than ${days} days ago.`);
      }
    } catch (err) {
      console.error('Retention job failed:', err.message);
    }
  };

  // Once at boot (so a server that has been down for a week still catches up), then daily.
  run();
  const timer = setInterval(run, DAY_MS);
  timer.unref(); // never hold the process open just for this
}
