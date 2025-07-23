const fs = require('fs');
const path = require('path');

console.log('📋 Supabase Migration Instructions');
console.log('===================================\n');

console.log('1. Go to your Supabase SQL Editor:');
console.log('   https://ozfxhdheoubxpqtsmede.supabase.co/project/default/sql\n');

console.log('2. Run these SQL files in order:\n');

const migrationsDir = path.resolve(__dirname, 'supabase/migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

migrationFiles.forEach((file, index) => {
  console.log(`Step ${index + 1}: ${file}`);
  console.log('----------------------------------------');
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  console.log(content);
  console.log('\n');
});

console.log('3. After running all migrations, run: npm run seed');