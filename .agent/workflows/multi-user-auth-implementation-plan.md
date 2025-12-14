---
description: Multi-User Authentication Implementation Plan
---

# 🔐 Multi-User Authentication Implementation Plan

## 📋 Overzicht

We gaan FlowCommand uitbreiden met multi-user support via Google Authentication, zodat:
- ✅ Gebruikers inloggen met hun Google account
- ✅ Elke gebruiker hun eigen n8n instances beheert
- ✅ Instances en API keys zijn **afgeschermd** per gebruiker
- ✅ Bestaande data (jouw instances) wordt gemigreerd naar jouw Google account

## 🛠️ Technologie Stack

### 1. Authentication: **NextAuth.js v5 (Auth.js)**
- **Waarom**: Industry standard voor Next.js
- **Features**: 
  - Google OAuth out-of-the-box
  - Session management
  - Server-side auth met App Router
  - TypeScript support
- **Website**: https://authjs.dev/

### 2. Database: **SQLite met Prisma ORM**
- **Waarom**: 
  - Eenvoudig te migreren vanuit file-based storage
  - Geen extra database server nodig
  - Works in Docker
  - Eenvoudig te upgraden naar PostgreSQL later
- **Prisma**: 
  - Type-safe database queries
  - Automatic migrations
  - Perfect voor Next.js + TypeScript

### 3. Session Storage: **Database Sessions**
- Sessions opslaan in database (veiliger dan JWT voor sensitive data)

## 🗄️ Database Schema

### Nieuwe Database Structuur (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  instances     Instance[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model Instance {
  id        String   @id @default(cuid())
  name      String
  url       String
  apiKey    String   // TODO: Encrypt in production
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("instances")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

### Database Relaties

```
User (1) ──→ (N) Instances
  │
  ├──→ (N) Accounts (Google OAuth data)
  └──→ (N) Sessions (Active login sessions)
```

## 📦 Benodigde Dependencies

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",
    "@prisma/client": "^5.22.0",
    "@auth/prisma-adapter": "^2.7.4"
  },
  "devDependencies": {
    "prisma": "^5.22.0"
  }
}
```

## 🔧 Implementatie Stappen

### FASE 1: Google OAuth Setup (15 min)

#### Stap 1.1: Google Cloud Console
1. Ga naar https://console.cloud.google.com/
2. Maak een nieuw project aan: "FlowCommand"
3. Ga naar **APIs & Services** → **Credentials**
4. Klik **Create Credentials** → **OAuth 2.0 Client ID**
5. Configureer OAuth consent screen:
   - Application name: "FlowCommand"
   - User support email: jouw email
   - Authorized domains: je productie domein
6. Maak OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://cto360.nl` (productie)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://cto360.nl/api/auth/callback/google`
7. Kopieer **Client ID** en **Client Secret**

#### Stap 1.2: Environment Variables
Voeg toe aan `.env.local`:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Database
DATABASE_URL="file:./data/flowcommand.db"
```

**NEXTAUTH_SECRET genereren:**
```bash
openssl rand -base64 32
```

### FASE 2: Database Setup (30 min)

#### Stap 2.1: Installeer Prisma
```bash
npm install @prisma/client @auth/prisma-adapter
npm install -D prisma
```

#### Stap 2.2: Initialize Prisma
```bash
npx prisma init --datasource-provider sqlite
```

#### Stap 2.3: Prisma Schema
Maak `prisma/schema.prisma` met het schema hierboven

#### Stap 2.4: Generate Prisma Client
```bash
npx prisma generate
```

#### Stap 2.5: Run Migration
```bash
npx prisma migrate dev --name init
```

Dit creëert:
- `data/flowcommand.db` (SQLite database)
- Migration files in `prisma/migrations/`

### FASE 3: NextAuth Setup (45 min)

#### Stap 3.1: Auth Configuration
Maak `lib/auth.ts`:
```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
```

#### Stap 3.2: Prisma Client
Maak `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### Stap 3.3: API Route
Maak `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

#### Stap 3.4: Sign In Page
Maak `app/auth/signin/page.tsx`:
```typescript
import { signIn } from "@/lib/auth"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          <span className="text-gradient">FlowCommand</span>
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Sign in to manage your n8n instances
        </p>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="w-full bg-white text-slate-900 font-medium py-3 px-4 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  )
}
```

### FASE 4: Middleware & Route Protection (20 min)

#### Stap 4.1: Middleware
Maak `middleware.ts` in root:
```typescript
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ['/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)'],
}
```

#### Stap 4.2: Session Helper
Update `lib/auth.ts` met helper:
```typescript
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}
```

### FASE 5: Update Storage Layer (1 uur)

#### Stap 5.1: Update Storage Functions
Vervang `lib/storage.ts`:
```typescript
import { prisma } from './prisma'
import { N8nInstance } from './n8n-client'

export async function getStoredInstances(userId: string): Promise<N8nInstance[]> {
  const instances = await prisma.instance.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  
  return instances.map(i => ({
    id: i.id,
    name: i.name,
    url: i.url,
    apiKey: i.apiKey,
  }))
}

export async function saveInstance(userId: string, instance: N8nInstance): Promise<N8nInstance> {
  const saved = await prisma.instance.upsert({
    where: { id: instance.id },
    update: {
      name: instance.name,
      url: instance.url,
      apiKey: instance.apiKey,
    },
    create: {
      id: instance.id,
      name: instance.name,
      url: instance.url,
      apiKey: instance.apiKey,
      userId,
    }
  })
  
  return {
    id: saved.id,
    name: saved.name,
    url: saved.url,
    apiKey: saved.apiKey,
  }
}

export async function deleteInstance(userId: string, id: string): Promise<void> {
  await prisma.instance.deleteMany({
    where: { 
      id,
      userId // Security: only delete own instances
    }
  })
}
```

### FASE 6: Update UI Components (30 min)

#### Stap 6.1: Add Sign Out Button
Update `app/layout.tsx`:
```typescript
import { auth, signOut } from "@/lib/auth"

export default async function RootLayout({ children }) {
  const session = await auth()
  
  return (
    <html>
      <body>
        {session && (
          <header className="border-b border-slate-800">
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img src={session.user.image} className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-slate-400">
                  {session.user?.email}
                </span>
              </div>
              <form action={async () => {
                "use server"
                await signOut()
              }}>
                <button className="text-sm text-slate-500 hover:text-red-400">
                  Sign Out
                </button>
              </form>
            </div>
          </header>
        )}
        {children}
      </body>
    </html>
  )
}
```

#### Stap 6.2: Update Dashboard
Update `app/page.tsx`:
```typescript
import { auth } from "@/lib/auth"
import { getStoredInstances } from '@/lib/storage'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  const instances = await getStoredInstances(session.user.id)
  
  // ... rest of component
}
```

#### Stap 6.3: Update API Routes
Alle API routes in `app/api/instances/` moeten aangepast worden om userId te checken:
```typescript
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const instances = await getStoredInstances(session.user.id)
  return NextResponse.json(instances)
}
```

### FASE 7: Data Migratie (20 min)

#### Stap 7.1: Migratie Script
Maak `scripts/migrate-instances.ts`:
```typescript
import { prisma } from '../lib/prisma'
import fs from 'fs'
import path from 'path'

async function migrate() {
  // Read old instances.json
  const dataFile = path.join(process.cwd(), 'data', 'instances.json')
  const oldInstances = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
  
  // Hard-code YOUR Google email here
  const YOUR_EMAIL = 'jouw-google-email@gmail.com'
  
  // Find or create your user
  let user = await prisma.user.findUnique({
    where: { email: YOUR_EMAIL }
  })
  
  if (!user) {
    console.log('User not found. Please sign in first with Google.')
    process.exit(1)
  }
  
  console.log(`Migrating ${oldInstances.length} instances to user: ${user.email}`)
  
  // Migrate instances
  for (const instance of oldInstances) {
    await prisma.instance.create({
      data: {
        id: instance.id,
        name: instance.name,
        url: instance.url,
        apiKey: instance.apiKey,
        userId: user.id,
      }
    })
    console.log(`✓ Migrated: ${instance.name}`)
  }
  
  console.log('✅ Migration complete!')
  
  // Backup old file
  fs.renameSync(dataFile, dataFile + '.backup')
}

migrate().catch(console.error).finally(() => prisma.$disconnect())
```

#### Stap 7.2: Run Migratie
```bash
# Eerst inloggen met Google in de app
# Daarna:
npx tsx scripts/migrate-instances.ts
```

## 🔒 Security Checklist

- [x] Sessions in database (niet in cookies)
- [x] Instances gefilterd per userId
- [x] API routes hebben auth check
- [x] Middleware beschermt alle routes
- [x] HTTPS redirect in productie
- [ ] **TODO**: API key encryption (fase 2)
- [ ] **TODO**: Rate limiting (fase 2)

## 📝 Environment Variables Overzicht

### Development (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
DATABASE_URL="file:./data/flowcommand.db"
GEMINI_API_KEY=your-gemini-key
```

### Production (EasyPanel)
Voeg toe in EasyPanel environment variables:
```env
NEXTAUTH_URL=https://cto360.nl
NEXTAUTH_SECRET=same-secret-as-dev
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
DATABASE_URL="file:./data/flowcommand.db"
GEMINI_API_KEY=your-gemini-key
```

## 🐳 Docker Updates

### Dockerfile - GEEN WIJZIGINGEN NODIG
De current Dockerfile werkt perfect omdat:
- SQLite database in `/app/data` volume
- Volume mount persisteert data tussen deployments

### docker-compose.yml - Update volumes
```yaml
volumes:
  - flow-command-data:/app/data  # Contains SQLite DB
```

## 🚀 Deployment Workflow

### Lokaal Testen
1. Google OAuth configureren
2. `npm install` - nieuwe dependencies
3. `npx prisma migrate dev` - database setup
4. App starten, inloggen met Google
5. Migratie script draaien
6. Testen dat instances werken

### Naar Productie
1. Push naar GitHub
2. EasyPanel auto-deploy
3. Add environment variables in EasyPanel
4. Volume mount voor `/app/data` checken
5. In productie één keer inloggen met Google
6. Database wordt automatisch aangemaakt

## 📊 Migratie Impact

### Wat blijft hetzelfde:
- ✅ UI/UX unchanged
- ✅ Docker setup
- ✅ EasyPanel deployment
- ✅ AI analysis features
- ✅ N8N client code

### Wat verandert:
- 🔄 File JSON → SQLite database
- 🔄 Public → User-specific instances
- 🔄 No auth → Google OAuth required
- 🔄 Single user → Multi-user

## ⏱️ Tijdsinschatting

- **Google OAuth Setup**: 15 min
- **Database Setup**: 30 min
- **NextAuth Implementation**: 45 min
- **Middleware & Security**: 20 min
- **Storage Layer Update**: 60 min
- **UI Updates**: 30 min
- **Data Migration**: 20 min
- **Testing**: 30 min

**Totaal**: ~4 uur werk

## 🎯 Risks & Mitigations

### Risk 1: Data Loss tijdens migratie
**Mitigation**: Backup script maakt `.backup` file

### Risk 2: Google OAuth configuratie fout
**Mitigation**: Duidelijke stap-voor-stap guide

### Risk 3: Database locked in Docker
**Mitigation**: Proper volume mount + WAL mode

## ✅ Testing Checklist

Na implementatie testen:
- [ ] Inloggen met Google werkt
- [ ] Instances zijn user-specific
- [ ] Andere user ziet mijn instances NIET
- [ ] Sign out functionaliteit
- [ ] Migratie van oude data succesvol
- [ ] AI analysis werkt nog
- [ ] Docker deployment werkt
- [ ] Productie deployment werkt

## 🔄 Rollback Plan

Als er iets mis gaat:
```bash
git checkout HEAD~1  # Vorige commit
git push -f origin main  # Force push (alleen als nodig!)
```

Old data is nog in `data/instances.json.backup`

---

**Klaar om te starten?** Laten we deze stap voor stap implementeren! 🚀
