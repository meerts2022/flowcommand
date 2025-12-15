# FlowCommand Deployment Guide

## Production Deployment op EasyPanel

Deze guide beschrijft de volledige deployment van FlowCommand naar productie op EasyPanel (https://cto360.nl).

---

## 📋 Prerequisites

- **EasyPanel account** met toegang
- **GitHub repository** verbonden met EasyPanel
- **Google OAuth credentials** (Client ID & Secret)
- **Gemini API key** voor AI features
- **Domain** (cto360.nl) geconfigureerd in EasyPanel

---

## 🔧 Environment Variables

Stel de volgende environment variables in via EasyPanel:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://cto360.nl
NEXTAUTH_SECRET=<your-secret-key>
AUTH_TRUST_HOST=true

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Database
DATABASE_URL=file:/app/data/flowcommand.db

# AI Features
GEMINI_API_KEY=<your-gemini-api-key>
```

### Important Notes:
- `DATABASE_URL` MOET een **absoluut pad** zijn: `file:/app/data/flowcommand.db`
- `AUTH_TRUST_HOST=true` is nodig voor NextAuth in productie
- `NEXTAUTH_SECRET` genereer via: `openssl rand -base64 32`

---

## 🚀 Deployment Process

### 1. Push naar GitHub

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### 2. Automatische Build

EasyPanel detecteert de push en start automatisch de build via Dockerfile:
- Dependencies installeren
- Prisma Client genereren (met correcte binary targets)
- Next.js build
- Docker image maken

### 3. Database Initialisatie (EERSTE DEPLOYMENT)

**Na de eerste deployment**, open een terminal in EasyPanel (Shell - Sh) en run:

```bash
# Stel DATABASE_URL in
export DATABASE_URL="file:/app/data/flowcommand.db"

# Run database migration
node scripts/run-migration.js

# Verifieer dat alle tables zijn aangemaakt
node scripts/check-db.js
```

**Expected output van `check-db.js`:**
```
📋 Tables in database:
  - users
  - accounts
  - sessions
  - instances
  - verification_tokens
```

### 4. Test de Applicatie

1. Ga naar: https://cto360.nl
2. Klik "Sign in with Google"
3. Login met je Google account
4. Dashboard zou moeten verschijnen! 🎉

---

## 🗄️ Database Management

### Database Locatie
- **Pad:** `/app/data/flowcommand.db`
- **Type:** SQLite
- **Mounted volume:** EasyPanel mount `/app/data` voor persistence

### Database Scripts

```bash
# Check welke tables er zijn
node scripts/check-db.js

# Run migrations (voert alle SQL statements uit)
node scripts/run-migration.js

# Debug SQL parsing
node scripts/debug-sql.js
```

### Database Reset (ONLY IF NEEDED)

```bash
# Verwijder database
rm /app/data/flowcommand.db

# Maak opnieuw aan
export DATABASE_URL="file:/app/data/flowcommand.db"
node scripts/run-migration.js
```

---

## 🐛 Troubleshooting

### Problem: "UntrustedHost" Error

**Symptom:**
```
[auth][error] UntrustedHost: Host must be trusted
```

**Solution:**
1. Zorg dat `AUTH_TRUST_HOST=true` is ingesteld in environment variables
2. De code heeft ook `trustHost: true` in `lib/auth.ts` (beide zijn nodig)
3. Restart de container na het toevoegen van environment variables

---

### Problem: "Table does not exist" Error

**Symptom:**
```
The table `main.accounts` does not exist in the current database
```

**Solution:**
```bash
# Open terminal in EasyPanel
export DATABASE_URL="file:/app/data/flowcommand.db"
node scripts/run-migration.js
node scripts/check-db.js  # Verifieer alle 5 tables
```

---

### Problem: Prisma Binary Error

**Symptom:**
```
Prisma Client could not locate the Query Engine for runtime "linux-musl-openssl-3.0.x"
```

**Solution:**
Dit is al opgelost in de huidige configuratie:
- `prisma/schema.prisma` heeft `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`
- `Dockerfile` installeert OpenSSL in BEIDE build stages (builder + runner)
- Als dit toch voorkomt: rebuild de applicatie (trigger nieuwe deployment)

---

### Problem: Database File Permissions

**Symptom:**
```
Error code 14: Unable to open the database file
```

**Solution:**
```bash
# Maak data directory aan (indien nodig)
mkdir -p /app/data

# Maak database file aan met juiste permissions
touch /app/data/flowcommand.db
chmod 666 /app/data/flowcommand.db

# Run migration
export DATABASE_URL="file:/app/data/flowcommand.db"
node scripts/run-migration.js
```

---

## 📁 Important Files

### Dockerfile
- Installeert OpenSSL in builder stage (voor Prisma binary generation)
- Installeert OpenSSL in runner stage (voor Prisma runtime)
- Kopieert Prisma schema en client
- Kopieert custom scripts folder

### prisma/schema.prisma
- `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` voor Alpine Linux
- SQLite provider met `DATABASE_URL` env var

### lib/auth.ts
- `trustHost: true` voor productie deployment
- PrismaAdapter voor database authenticatie
- Google OAuth provider

### scripts/run-migration.js
- Leest migration SQL file
- Verwijdert comment regels (`-- CreateTable`)
- Split SQL in individuele statements
- Voert elk statement apart uit
- Skip "already exists" errors

---

## 🔄 Future Deployments

Voor nieuwe deployments:
1. Push code naar GitHub
2. EasyPanel rebuildt automatisch
3. **GEEN handmatige database stappen nodig** (database blijft bestaan in `/app/data`)
4. Test de applicatie

**Only run migrations manually als:**
- Je nieuwe migrations hebt toegevoegd
- Database is corrupt
- Na database reset

---

## 📊 Monitoring

### Check Logs
In EasyPanel → FlowCommand → Logs tab

**Zoek naar:**
- `✓ Ready in XXms` = App is gestart
- `[auth][error]` = Authentication errors
- `PrismaClientKnownRequestError` = Database errors

### Health Check
- **URL:** https://cto360.nl
- **Expected:** Login scherm verschijnt
- **After login:** Dashboard met instances

---

## 🛡️ Security Notes

1. **Environment Variables:** Bewaar deze ALLEEN in EasyPanel, niet in git
2. **Database Backups:** Maak regelmatig backups van `/app/data/flowcommand.db`
3. **Google OAuth:** Whitelist alleen `https://cto360.nl` in Google Console
4. **NEXTAUTH_SECRET:** Gebruik een sterke random key, verander NOOIT in productie

---

## 📞 Support

Bij problemen:
1. Check de logs in EasyPanel
2. Check deze troubleshooting guide
3. Run `node scripts/check-db.js` om database status te checken
4. Check `.agent/workflows/production-deployment-blocker.md` voor historische issues

---

**🎉 Deployment succesvol! FlowCommand draait op https://cto360.nl**
