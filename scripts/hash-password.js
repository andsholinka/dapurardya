/**
 * Generate bcrypt hash for admin password.
 * Run: node scripts/hash-password.js "your-password"
 */
const bcrypt = require("bcryptjs");
const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.js \"your-password\"");
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 10);
console.log("Add to .env.local:");
console.log("ADMIN_PASSWORD_HASH=" + hash);
