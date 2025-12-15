const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log('📝 Reading migration SQL...');
        const sql = fs.readFileSync('/app/prisma/migrations/20251214230237_init/migration.sql', 'utf8');

        console.log('⚙️  Executing SQL...');
        await prisma.$executeRawUnsafe(sql);

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
