import mysql from "mysql2/promise";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(dbUrl);

try {
  // Check if column already exists
  const [cols] = await conn.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='passwordHash' AND TABLE_SCHEMA=DATABASE()"
  );
  if (cols.length > 0) {
    console.log("passwordHash column already exists, skipping.");
  } else {
    await conn.execute("ALTER TABLE `users` ADD `passwordHash` varchar(256)");
    console.log("✓ passwordHash column added to users table.");
  }
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await conn.end();
}
