import { scrypt as scryptCallback, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const scrypt = promisify(scryptCallback);
const rl = createInterface({ input: stdin, output: stdout });
try {
  const password = await rl.question("Enter a strong admin password (input will be visible): ");
  if (password.length < 14) {
    console.error("Use at least 14 characters.");
    process.exitCode = 1;
  } else {
    const salt = randomBytes(16).toString("hex");
    const hash = (await scrypt(password, salt, 64)).toString("hex");
    console.log(`\nCLAUDVIA_ADMIN_PASSWORD_HASH=scrypt$${salt}$${hash}\n`);
    console.log("Copy the hash into your private environment variables. Do not share the password.");
  }
} finally {
  rl.close();
}
