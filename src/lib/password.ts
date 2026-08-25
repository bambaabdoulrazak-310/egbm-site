import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// Exclut les caractères ambigus (0/O, 1/l/I) pour rester lisible si retapé à la main.
const TEMP_PASSWORD_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

export function generateTemporaryPassword(length = 12) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += TEMP_PASSWORD_CHARS[randomInt(TEMP_PASSWORD_CHARS.length)];
  }
  return result;
}
