#!/usr/bin/env node

/**
 * Database initialization script
 * Runs the migration SQL directly via Prisma's raw query
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function initDatabase() {
    try {
        console.log('🔄 Initializing database...');

        // Read migration SQL
        const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', '20251214230237_init', 'migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split by semicolon and filter empty statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
            await prisma.$executeRawUnsafe(statement);
        }

        console.log('✅ Database initialized successfully!');

    } catch (error) {
        // Check if error is "table already exists"
        if (error.message && error.message.includes('already exists')) {
            console.log('ℹ️  Database already initialized (tables exist)');
        } else {
            console.error('❌ Error initializing database:', error);
            process.exit(1);
        }
    } finally {
        await prisma.$disconnect();
    }
}

initDatabase();
