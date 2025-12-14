import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function migrate() {
    try {
        // Read old instances.json
        const dataFile = path.join(process.cwd(), 'data', 'instances.json')
        const rawData = fs.readFileSync(dataFile, 'utf-8')
        const oldInstances = JSON.parse(rawData)

        console.log(`📦 Found ${oldInstances.length} instances in instances.json`)

        // Hard-code YOUR Google email
        const YOUR_EMAIL = 'frankmeerts75@gmail.com'

        // Find your user in the database
        const user = await prisma.user.findUnique({
            where: { email: YOUR_EMAIL }
        })

        if (!user) {
            console.error('❌ User not found! Please make sure you are logged in first.')
            console.error(`   Looking for email: ${YOUR_EMAIL}`)
            process.exit(1)
        }

        console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)
        console.log(`\n🔄 Migrating ${oldInstances.length} instances...\n`)

        // Migrate instances
        let migrated = 0
        for (const instance of oldInstances) {
            try {
                await prisma.instance.create({
                    data: {
                        id: instance.id,
                        name: instance.name,
                        url: instance.url,
                        apiKey: instance.apiKey,
                        userId: user.id,
                    }
                })
                console.log(`  ✓ Migrated: ${instance.name}`)
                migrated++
            } catch (error: any) {
                if (error.code === 'P2002') {
                    console.log(`  ⚠ Skipped (already exists): ${instance.name}`)
                } else {
                    console.error(`  ✗ Failed: ${instance.name}`, error.message)
                }
            }
        }

        console.log(`\n✅ Migration complete!`)
        console.log(`   Migrated: ${migrated}/${oldInstances.length} instances`)

        // Backup old file
        const backupFile = dataFile + '.backup.' + Date.now()
        fs.renameSync(dataFile, backupFile)
        console.log(`\n📁 Backed up old file to: ${path.basename(backupFile)}`)

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

migrate()
