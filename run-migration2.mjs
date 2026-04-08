import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const conn = await mysql.createConnection(dbUrl);

const statements = [
  `CREATE TABLE IF NOT EXISTS \`products\` (
    \`id\` varchar(64) NOT NULL,
    \`name\` varchar(512) NOT NULL,
    \`description\` text,
    \`priceEUR\` int NOT NULL DEFAULT 0,
    \`priceTRY\` int NOT NULL DEFAULT 0,
    \`imageUrl\` text,
    \`imageUrls\` json,
    \`mainCategory\` varchar(128),
    \`subCategory\` varchar(128),
    \`productCode\` varchar(128),
    \`colorCode\` varchar(64),
    \`videoUrl\` text,
    \`createdAt\` bigint NOT NULL,
    CONSTRAINT \`products_id\` PRIMARY KEY(\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`banners\` (
    \`id\` varchar(64) NOT NULL,
    \`imageUrl\` text NOT NULL,
    \`title\` varchar(512),
    \`link\` varchar(1024),
    \`sortOrder\` int DEFAULT 0,
    CONSTRAINT \`banners_id\` PRIMARY KEY(\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`siteSettings\` (
    \`key\` varchar(128) NOT NULL,
    \`value\` json,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`siteSettings_key\` PRIMARY KEY(\`key\`)
  )`,
];

for (const stmt of statements) {
  try {
    console.log('Running:', stmt.substring(0, 60) + '...');
    await conn.execute(stmt);
    console.log('OK');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Verify tables exist
const [rows] = await conn.execute("SHOW TABLES");
console.log('\nExisting tables:');
rows.forEach(row => console.log(' -', Object.values(row)[0]));

await conn.end();
console.log('\nMigration complete!');
