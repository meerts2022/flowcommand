# Database Setup & Migration Guide

## Overview

FlowCommand gebruikt SQLite voor data persistence met Prisma als ORM. Deze guide legt uit hoe de database werkt en hoe migrations te beheren.

---

## 🗄️ Database Schema

### Tables

**users**
- Bevat gebruikersdata (email, naam, image)
- Relatie met accounts, sessions en instances

**accounts**
- OAuth account informatie (Google)
- Provider credentials en tokens

**sessions**
- Actieve gebruikersessies
- Session tokens voor authenticatie

**instances**
- n8n instances per gebruiker
- Bevat URL, apiKey, naam
- User-scoped data

**verification_tokens**
- Email verificatie tokens
- Voor toekomstig gebruik

---

## 📁 Migration Files

### Locatie
```
prisma/
  schema.prisma           # Database schema definitie
  migrations/
    20251214230237_init/  # Initial migration
      migration.sql       # SQL statements
```

### Schema File (`prisma/schema.prisma`)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Key Points:**
- `binaryTargets` zorgt voor Alpine Linux compatibility
- `DATABASE_URL` moet absoluut pad zijn in productie

---

## 🚀 Running Migrations

### Development (Lokaal)

```bash
# Maak nieuwe migration aan
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: VERWIJDERT DATA!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Production (EasyPanel)

**⚠️ BELANGRIJK:** Gebruik NIET `npx prisma migrate deploy` in productie!

**Waarom niet?**
- Prisma CLI binary is niet beschikbaar in Next.js standalone output
- `npx` download verkeerde Prisma versie (7.x i.p.v. 5.22.0)
- Causes binary compatibility issues

**Gebruik in plaats daarvan:**

```bash
# Stel DATABASE_URL in
export DATABASE_URL="file:/app/data/flowcommand.db"

# Run custom migration script
node scripts/run-migration.js
```

---

## 🛠️ Migration Scripts

### `scripts/run-migration.js`

**Wat het doet:**
1. Leest `migration.sql` file
2. Verwijdert comment regels (`-- CreateTable` etc.)
3. Split SQL in individuele statements (bij `;`)
4. Voert elk statement apart uit via Prisma
5. Skipt "table already exists" errors

**Usage:**
```bash
export DATABASE_URL="file:/app/data/flowcommand.db"
node scripts/run-migration.js
```

**Expected Output:**
```
📝 Reading migration SQL...
⚙️  Executing 10 SQL statements...
  [1/10] Executing...
  [2/10] Executing...
  ...
  [10/10] Executing...
✅ Migration completed successfully!
```

---

### `scripts/check-db.js`

**Wat het doet:**
- Lijst alle tables in de database
- Gebruikt Prisma's raw query functionaliteit

**Usage:**
```bash
node scripts/check-db.js
```

**Expected Output:**
```
📋 Tables in database:
  - users
  - accounts
  - sessions
  - instances
  - verification_tokens
```

---

### `scripts/debug-sql.js`

**Wat het doet:**
- Toont SQL file grootte
- Toont eerste 200 characters
- Toont aantal statements gevonden

**Usage:**
```bash
node scripts/debug-sql.js
```

Handig voor troubleshooting als migrations niet werken.

---

## 🔧 Common Issues & Solutions

### Issue 1: "Executing 0 SQL statements"

**Oorzaak:**
SQL parsing filter verwijdert alle statements.

**Oplossing:**
Check `run-migration.js` - moet eerst comment lines verwijderen, dan splitten:

```javascript
// Remove comment lines first
const cleanedSql = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

// Then split into statements
const statements = cleanedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
```

---

### Issue 2: "table already exists" bij re-run

**Oorzaak:**
Migration script wordt opnieuw gerund op bestaande database.

**Oplossing:**
Script skipt automatisch "already exists" errors:

```javascript
try {
    await prisma.$executeRawUnsafe(stmt);
} catch (error) {
    if (!error.message.includes('already exists')) {
        throw error;
    }
    console.log(`  ⚠️  Skipped (already exists)`);
}
```

---

### Issue 3: Incomplete Migration (1 table i.p.v. 5)

**Oorzaak:**
SQL werd uitgevoerd als één statement, SQLite accepteert geen multiple statements.

**Oplossing:**
Verwijder database en herrun:

```bash
rm /app/data/flowcommand.db
export DATABASE_URL="file:/app/data/flowcommand.db"
node scripts/run-migration.js
node scripts/check-db.js  # Verifieer 5 tables
```

---

### Issue 4: Database File Niet Gevonden

**Oorzaak:**
`DATABASE_URL` is niet ingesteld of heeft verkeerd pad.

**Oplossing:**
```bash
# Stel correct absoluut pad in
export DATABASE_URL="file:/app/data/flowcommand.db"

# Verifieer
echo $DATABASE_URL

# Run migration
node scripts/run-migration.js
```

---

## 📊 Database Inspection

### Check Tables
```bash
node scripts/check-db.js
```

### Check Database File
```bash
ls -la /app/data/flowcommand.db
```

**Goede output:**
```
-rw-rw-rw- 1 nextjs nogroup 12288 Dec 15 08:54 flowcommand.db
```

- Size > 0 bytes ✓
- Permissions: readable/writable ✓

---

### Manual SQL Queries (Advanced)

Als je `sqlite3` hebt geïnstalleerd:

```bash
sqlite3 /app/data/flowcommand.db

# Show tables
.tables

# Show schema
.schema users

# Count users
SELECT COUNT(*) FROM users;

# Exit
.exit
```

**Note:** `sqlite3` is meestal NIET beschikbaar in productie container.

---

## 🔄 Adding New Migrations

### Step 1: Create Migration (Lokaal)

```bash
# Wijzig schema.prisma
# Voeg nieuwe models/velden toe

# Maak migration aan
npx prisma migrate dev --name add_new_feature

# Test lokaal
npm run dev
```

### Step 2: Deploy to Production

```bash
# Commit en push
git add prisma/
git commit -m "feat: Add new feature migration"
git push origin main
```

### Step 3: Run Migration in Production

Na deployment, in EasyPanel terminal:

```bash
export DATABASE_URL="file:/app/data/flowcommand.db"
node scripts/run-migration.js
```

**⚠️ BELANGRIJK:**
- Test ALTIJD eerst lokaal
- Maak backup van productie database
- Check dat schema compatibel is (geen breaking changes)

---

## 💾 Backup & Restore

### Backup

```bash
# In EasyPanel terminal
cp /app/data/flowcommand.db /app/data/flowcommand.db.backup

# Download via EasyPanel file browser
# Of gebruik scp/sftp
```

### Restore

```bash
# Stop applicatie
# Restore backup
cp /app/data/flowcommand.db.backup /app/data/flowcommand.db

# Restart applicatie
```

---

## 🎯 Best Practices

1. **Altijd Backups:** Voor elke productie migration
2. **Test Lokaal:** Nooit direct in productie testen
3. **Incremental Changes:** Kleine migrations, vaak committen
4. **Check Scripts:** `check-db.js` na elke migration
5. **Document Changes:** Beschrijf migrations in commit messages

---

## 📚 Resources

- [Prisma Migrations Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [Prisma Client Docs](https://www.prisma.io/docs/concepts/components/prisma-client)

---

**Database succesvol geconfigureerd! ✅**
