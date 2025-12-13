# FlowCommand Deployment naar EasyPanel (Hostinger VPS)

## Voorbereiding

### 1. Wat je nodig hebt:
- ✅ GitHub repository: https://github.com/meerts2022/flowcommand.git
- ✅ Hostinger VPS met EasyPanel geïnstalleerd
- ✅ Root toegang tot je VPS
- ✅ Gemini API Key

### 2. Environment Variables die je nodig hebt:
- `GEMINI_API_KEY` - Je Gemini API sleutel voor AI error analysis

## Deployment Stappenplan

### Stap 1: Log in op EasyPanel
1. Open je EasyPanel dashboard (meestal op `https://[je-vps-ip]:3000`)
2. Log in met je credentials

### Stap 2: Creëer een Nieuw Project
1. Klik op **"New"** → **"Project"**
2. Geef het project een naam: `flowcommand`
3. Klik op **"Create"**

### Stap 3: Creëer een Nieuwe App vanuit GitHub
1. Binnen je project, klik op **"New"** → **"App"**
2. Kies voor **"Git Repository"** als source
3. Vul de volgende informatie in:
   - **Repository URL**: `https://github.com/meerts2022/flowcommand.git`
   - **Branch**: `main`
   - **Name**: `flowcommand`

### Stap 4: Build Configuratie
EasyPanel zal automatisch je `Dockerfile` detecteren. Zorg ervoor dat:
- **Build Method**: `Dockerfile` is geselecteerd
- **Dockerfile Path**: `/Dockerfile` (default, staat in root)

### Stap 5: Environment Variables Instellen
1. Ga naar de **"Environment"** tab
2. Voeg de volgende environment variable toe:
   ```
   GEMINI_API_KEY=jouw_gemini_api_key_hier
   ```
   (Gebruik de key uit je lokale `.env.local` file)

### Stap 6: Domein & Netwerk Configuratie
1. Ga naar de **"Domains"** tab
2. Voeg een domein of subdomein toe, bijvoorbeeld:
   - `flowcommand.jouwdomein.nl`
3. EasyPanel zal automatisch een gratis SSL certificaat aanvragen
4. Zorg dat de **Port** ingesteld staat op: `3000` (dit is de port waar Next.js draait)

### Stap 7: Deploy!
1. Klik op **"Deploy"** knop rechtsboven
2. EasyPanel zal nu:
   - Je GitHub repository clonen
   - Docker image bouwen met je Dockerfile
   - Container starten
   - SSL certificaat aanvragen
3. Dit kan 2-5 minuten duren voor de eerste deployment

### Stap 8: Verificatie
1. Zodra deployment voltooid is (groene status), open je domein in de browser
2. Je zou de FlowCommand dashboard moeten zien
3. Test of alle n8n instances zichtbaar zijn

## Auto-Deploy Instellen (Optioneel maar aangeraden!)

### Push-to-Deploy Inschakelen
1. In je app settings, ga naar **"Source"** tab
2. Schakel **"Auto Deploy"** in
3. EasyPanel voegt nu automatisch een webhook toe aan je GitHub repository
4. Elke keer dat je code pusht naar `main`, zal er automatisch een nieuwe deployment starten!

Dit betekent:
- Lokaal wijzigingen maken
- `git push origin main`
- Automatisch live binnen 2-5 minuten! 🚀

## Troubleshooting

### Container start niet
- Check de **Logs** tab in EasyPanel
- Zorg dat `GEMINI_API_KEY` correct is ingesteld
- Verifieer dat port 3000 blootgesteld is

### Geen verbinding met n8n instances
- Check of de VPS uitgaande HTTPS calls kan maken
- Verifieer dat de n8n API keys in `lib/storage.ts` correct zijn

### Build faalt
- Check de **Build Logs** in EasyPanel
- Zorg dat je `Dockerfile` correct is (moet in root staan)
- Verifieer dat `next.config.ts` output: 'standalone' heeft

## Data Persistentie

### AI Analysis Cache
De AI analysis cache wordt opgeslagen in `data/analysis-cache.json`. Om deze te behouden tussen deployments:

1. Ga naar **"Mounts"** tab in EasyPanel
2. Voeg een mount toe:
   - **Host Path**: `/data/flowcommand-cache`
   - **Container Path**: `/app/data`
   - **Type**: `Bind Mount`

Dit zorgt ervoor dat je cache behouden blijft tussen updates!

## Volgende Stappen

Na succesvolle deployment:
1. ✅ Test alle functionaliteit (instances, executions, AI analysis)
2. ✅ Configureer monitoring/alerts in EasyPanel indien nodig
3. ✅ Schakel Auto-Deploy in voor toekomstige updates
4. ✅ Maak een backup van je environment variables

## Updates Pushen

Wanneer je lokaal wijzigingen maakt:
```bash
git add .
git commit -m "Beschrijving van wijzigingen"
git push origin main
```

Als Auto-Deploy aan staat → Automatisch live! 🎉
Anders → Klik handmatig op "Deploy" in EasyPanel

---

**Support**: Als je problemen tegenkomt, check de EasyPanel logs en documentatie op https://easypanel.io/docs
