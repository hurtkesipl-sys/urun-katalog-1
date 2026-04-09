/**
 * Admin kullanıcısı oluşturma scripti
 * Kullanım: node create-admin.mjs <email> <sifre>
 * Örnek:    node create-admin.mjs admin@sirketim.com gizlisifre123
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import "dotenv/config";

const [,, email, password] = process.argv;

if (!email || !password) {
  console.error("Kullanım: node create-admin.mjs <email> <sifre>");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL ortam değişkeni ayarlanmamış.");
  process.exit(1);
}

const conn = await mysql.createConnection(dbUrl);

try {
  // Mevcut kullanıcıyı kontrol et
  const [existing] = await conn.execute(
    "SELECT id, email, role FROM users WHERE email = ? LIMIT 1",
    [email.toLowerCase().trim()]
  );

  const hash = await bcrypt.hash(password, 12);

  if (existing.length > 0) {
    // Güncelle
    await conn.execute(
      "UPDATE users SET passwordHash = ?, role = 'admin' WHERE email = ?",
      [hash, email.toLowerCase().trim()]
    );
    console.log(`✓ Mevcut kullanıcı güncellendi: ${email} (role: admin)`);
  } else {
    // Yeni oluştur
    const openId = `local_${nanoid()}`;
    const now = new Date();
    await conn.execute(
      `INSERT INTO users (openId, name, email, loginMethod, role, passwordHash, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, ?, 'local', 'admin', ?, ?, ?, ?)`,
      [openId, email.split("@")[0], email.toLowerCase().trim(), hash, now, now, now]
    );
    console.log(`✓ Admin kullanıcısı oluşturuldu: ${email}`);
  }
} catch (err) {
  console.error("Hata:", err.message);
  process.exit(1);
} finally {
  await conn.end();
}
