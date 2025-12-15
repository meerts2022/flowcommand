const fs = require('fs');

console.log('📋 Checking migration.sql file...\n');

const sql = fs.readFileSync('/app/prisma/migrations/20251214230237_init/migration.sql', 'utf8');

console.log('File size:', sql.length, 'bytes');
console.log('First 200 characters:');
console.log(sql.substring(0, 200));
console.log('\n---\n');

const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('Statements found after split:', sql.split(';').length);
console.log('Statements after filter:', statements.length);
console.log('\nFirst statement:');
console.log(statements[0]);
