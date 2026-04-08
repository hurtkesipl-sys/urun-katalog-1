import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = readFileSync('./drizzle/0001_burly_invaders.sql', 'utf-8');

// Split by --> statement-breakpoint
const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

const conn = await mysql.createConnection(dbUrl);

for (const stmt of statements) {
  try {
    console.log('Running:', stmt.substring(0, 60) + '...');
    await conn.execute(stmt);
    console.log('OK');
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('Table already exists, skipping');
    } else {
      console.error('Error:', err.message);
    }
  }
}

await conn.end();
console.log('Migration complete!');
