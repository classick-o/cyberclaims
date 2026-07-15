// CommonJS entry point — the ONLY file LiteSpeed's lsnode.js loads directly.
//
// Hostinger serves Node apps through /usr/local/lsws/fcgi-bin/lsnode.js, which loads
// the configured startup file with require(). require() cannot load an ESM module graph
// that uses top-level await (ERR_REQUIRE_ASYNC_MODULE), and this app is ESM with TLA
// throughout. A CommonJS file, by contrast, require()s cleanly — and dynamic import()
// from inside it CAN load ESM-with-TLA. So this shim is the require()-safe front door;
// boot.mjs (ESM) does the actual startup.
//
// require() of this file returns synchronously; the app finishes booting on later ticks
// and calls app.listen(), which lsnode hooks to wire up the socket.
import('./boot.mjs').catch((err) => {
  console.error('Fatal: failed to start application');
  console.error(err);
  process.exit(1);
});
