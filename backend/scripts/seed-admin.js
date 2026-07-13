// Creates an admin account. The only way one comes into existence — there is no
// public signup route, deliberately.
//
//   npm run seed:admin -- --email julia@cyberclaims.net --name "Julia Blokhina" --role admin
//
// Omit --password and one is generated and printed once. That's the better path:
// a password typed on the command line ends up in your shell history.

import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { pool } from '../src/config/database.js';
import { Admin } from '../src/models/Admin.js';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string', default: 'editor' },
    password: { type: 'string' },
  },
});

const fail = (msg) => {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
};

if (!values.email) fail('--email is required');
if (!values.name) fail('--name is required');
if (!['admin', 'editor'].includes(values.role)) fail('--role must be "admin" or "editor"');

if (values.password && values.password.length < 12) {
  fail('Password must be at least 12 characters. Or omit --password and let one be generated.');
}

// 24 bytes of base64url ≈ 192 bits. Not memorable — it belongs in a password manager.
const password = values.password ?? randomBytes(24).toString('base64url');
const generated = !values.password;

if (await Admin.findByEmail(values.email.toLowerCase())) {
  fail(`An account already exists for ${values.email}.`);
}

const id = await Admin.create({
  email: values.email,
  password,
  name: values.name,
  role: values.role,
});

console.log(`\n  Created ${values.role} #${id}  ${values.name} <${values.email.toLowerCase()}>`);
if (generated) {
  console.log(`\n  Password:  ${password}`);
  console.log('  This is shown once. Store it in a password manager now.\n');
} else {
  console.log('');
}

await pool.end();
