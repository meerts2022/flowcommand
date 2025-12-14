# 🚀 FlowCommand

**Mission Control for your N8N Fleet**

FlowCommand is een krachtig, real-time dashboard voor het monitoren en beheren van meerdere zelf-gehoste n8n instances. Met AI-gestuurde error analysis en een moderne, intuïtieve interface.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

## ✨ Features

### 📊 Real-time Monitoring
- **Live status** van al je n8n instances
- **Workflow counts** en laatste execution tracking
- **Automatic health checks** met visual indicators
- **Error detection** met instant notifications

### 🤖 AI-Powered Error Analysis
- Intelligente error analyse met **Google Gemini AI**
- Analyse in het **Nederlands** voor betere leesbaarheid
- Root cause identification
- Stap-voor-stap oplossingen
- Preventie tips en best practices
- **Smart caching** om API kosten te besparen

### 🎯 Workflow Management
- Overzicht van alle workflows per instance
- Recent execution history
- Detailed execution logs
- Direct links naar gefaalde executions

### 🎨 Modern UI/UX
- Glassmorphic design met dark mode
- Responsive voor desktop en mobile
- Real-time updates zonder pagina refresh
- Smooth animations en transitions

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Deployment**: Docker + EasyPanel
- **AI**: Google Gemini 3 Pro Preview
- **Storage**: File-based (instances & cache)

## 🚀 Quick Start

### Lokale Development

1. **Clone de repository**
   ```bash
   git clone https://github.com/meerts2022/flowcommand.git
   cd flowcommand
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Configureer environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Voeg je Gemini API key toe aan `.env.local`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open dashboard**
   - Browser: http://localhost:3000
   - Voeg je eerste n8n instance toe via Settings

### Docker (Aanbevolen voor Test)

```bash
docker-compose up --build
```

Open http://localhost:3000 in je browser.

## 📚 Documentatie

- [AI Features Setup](./AI_FEATURES.md) - Gemini AI configuratie
- [EasyPanel Deployment](./EASYPANEL_DEPLOYMENT.md) - Productie deployment
- [Deployment Environments](/.agent/workflows/deployment-environments.md) - Omgeving overzicht

## 🔧 Configuratie

### N8N Instance Toevoegen

1. Navigeer naar **Settings** in het dashboard
2. Klik op **"Add Instance"**
3. Vul in:
   - **Name**: Herkenbare naam (bijv. "Productie", "Test")
   - **URL**: Je n8n instance URL (bijv. `https://n8n.example.com`)
   - **API Key**: Je n8n API key (Settings → API in n8n)
4. Klik **Save**

Instance credentials worden veilig opgeslagen in `data/instances.json`.

### Gemini API Key Verkrijgen

1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Klik "Create API Key"
3. Kopieer de key naar je `.env.local`

**Kosten**: 60 requests/minuut gratis. Daarna betaald volgens [Google AI pricing](https://ai.google.dev/pricing).

## 📦 Deployment

### Productie (EasyPanel + Hostinger)

FlowCommand is geconfigureerd voor automatische deployment via EasyPanel:

1. Push code naar GitHub main branch
2. EasyPanel detecteert wijzigingen automatisch
3. Docker image wordt gebouwd
4. Nieuwe versie gaat live

Zie [EASYPANEL_DEPLOYMENT.md](./EASYPANEL_DEPLOYMENT.md) voor complete setup instructies.

### Custom Docker Deployment

```bash
# Build image
docker build -t flowcommand:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e GEMINI_API_KEY=your_key_here \
  --name flowcommand \
  flowcommand:latest
```

## 🗂️ Project Structuur

```
flowcommand/
├── app/
│   ├── page.tsx                    # Dashboard homepage
│   ├── components/
│   │   └── InstanceCard.tsx        # Instance status card
│   ├── instances/[id]/
│   │   ├── page.tsx                # Instance detail
│   │   └── executions/[executionId]/
│   │       ├── page.tsx            # Execution detail
│   │       └── analyze/page.tsx    # AI analysis
│   └── api/
│       ├── analyze-error/          # AI analysis endpoint
│       └── instances/              # Instance management API
├── lib/
│   ├── n8n-client.ts              # N8N API wrapper
│   ├── storage.ts                 # Data persistence
│   ├── config.ts                  # Configuration
│   └── analysis-cache.ts          # AI cache management
├── data/
│   ├── instances.json             # Stored instances (auto-created)
│   └── analysis-cache.json        # AI analysis cache (auto-created)
├── Dockerfile                     # Production container
├── docker-compose.yml             # Local development
└── .env.local                     # Environment variables (create from .env.example)
```

## 🛠️ Development

### Tech Details

- **Next.js 16** with App Router voor server-side rendering
- **TypeScript** voor type safety
- **Tailwind CSS v4** voor styling
- **File-based storage** (migrations naar database mogelijk)
- **Hybrid caching** voor optimale performance

### Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔐 Security

- **API Keys** worden **niet** in git opgeslagen (via .gitignore)
- N8N credentials in encrypted file storage
- Gemini API calls via HTTPS
- Docker runs as **non-root user**
- Input validation op alle endpoints

## 🐛 Troubleshooting

### "AI service not configured"
- Controleer of `GEMINI_API_KEY` is ingesteld in `.env.local`
- Restart development server na toevoegen key

### "Failed to connect" bij Instance
- Verifieer n8n instance URL (zonder `/home` of andere paden)
- Check n8n API key geldigheid
- Zorg dat n8n instance bereikbaar is via HTTPS

### Docker build faalt
- Zorg dat `next.config.ts` `output: "standalone"` bevat
- Verifieer dat alle dependencies in package.json staan

## 📈 Roadmap

- [ ] Database migratie (SQLite/PostgreSQL)
- [ ] Multi-user support met authenticatie
- [ ] Advanced monitoring dashboards
- [ ] Email alerts bij workflow failures
- [ ] Workflow activatie/deactivatie vanuit dashboard
- [ ] Export naar PDF/Excel
- [ ] Mobile app

## 🤝 Contributing

Contributions zijn welkom! Voor grote wijzigingen:

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

Dit project is eigendom van Frank Meerts (meerts2022).

## 🙏 Acknowledgments

- **Next.js** team voor het geweldige framework
- **Google Gemini** voor de AI capabilities
- **n8n** voor de automation platform
- **Hostinger** voor de VPS hosting
- **EasyPanel** voor deployment management

---

**Made with ❤️ for the n8n community**

Voor vragen of support: [GitHub Issues](https://github.com/meerts2022/flowcommand/issues)
