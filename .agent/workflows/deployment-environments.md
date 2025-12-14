---
description: FlowCommand Deployment Environments
---

# FlowCommand Deployment Environments

## Overzicht

FlowCommand heeft twee omgevingen:

### 1. Test/Development Omgeving (Lokaal)
- **Platform**: Docker op lokale laptop
- **Gebruik**: Ontwikkelen en testen van nieuwe features
- **Draaien**: `docker-compose up` vanuit projectdirectory
- **Database**: SQLite in Docker container (`/data` volume)
- **Poort**: Standaard 3000 (gedefinieerd in docker-compose.yml)

### 2. Productie Omgeving
- **URL**: https://cto360.nl ✅
- **Hosting Provider**: Hostinger VPS
- **VPS IP**: 72.60.38.17
- **Platform**: EasyPanel
- **SSL**: Let's Encrypt (automatisch)
- **Deployment**: Via GitHub repository (auto-deploy ingeschakeld)
- **Workflow**: 
  1. Code pushen naar GitHub
  2. EasyPanel detecteert automatisch wijzigingen
  3. EasyPanel deployt automatisch naar productie
  4. Live binnen 2-5 minuten

## Deployment Workflow

### Naar Productie Deployen

// turbo
1. Controleer of alle wijzigingen gecommit zijn:
```bash
git status
```

// turbo
2. Push naar GitHub:
```bash
git push origin main
```

3. EasyPanel detecteert en deployt automatisch de wijzigingen
4. Controleer de logs in EasyPanel dashboard

### Lokaal Testen voor Productie

// turbo
1. Start Docker omgeving:
```bash
docker-compose up --build
```

// turbo
2. Test de applicatie op http://localhost:3000

// turbo
3. Stop containers:
```bash
docker-compose down
```

## Belangrijke Documentatie

- `DEPLOYMENT.md` - Algemene deployment instructies
- `EASYPANEL_DEPLOYMENT.md` - Specifieke EasyPanel setup
- `PRODUCTION_DEPLOYMENT.md` - Productie deployment proces
- `AI_FEATURES.md` - AI functionaliteiten documentatie

## Configuratie Bestanden

- `.env.local` - Lokale environment variabelen (NIET committen)
- `.env.example` - Template voor environment variabelen
- `docker-compose.yml` - Docker configuratie voor lokale development
- `Dockerfile` - Container definitie voor productie
