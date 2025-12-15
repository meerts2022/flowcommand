const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log('📝 Reading migration SQL...');
        const sql = fs.readFileSync('/app/prisma/migrations/20251214230237_init/migration.sql', 'utf8');

        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`⚙️  Executing ${statements.length} SQL statements...`);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            console.log(`  [${i + 1}/${statements.length}] Executing...`);
            try {
                await prisma.$executeRawUnsafe(stmt);
            } catch (error) {
                // Ignore "table already exists" errors
                if (!error.message.includes('already exists')) {
                    throw error;
                }
                console.log(`  ⚠️  Skipped (already exists)`);
            }
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
