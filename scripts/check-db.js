const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        const tables = await prisma.$queryRaw`
            SELECT name FROM sqlite_master WHERE type='table'
        `;

        console.log('📋 Tables in database:');
        tables.forEach(t => console.log('  -', t.name));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
