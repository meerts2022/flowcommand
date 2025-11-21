# 🚀 FlowCommand Deployment Guide

## 📋 Overzicht
Deze guide helpt je om FlowCommand van je lokale computer naar GitHub en vervolgens naar je productieserver (Hostinger) te deployen.

## Stap 1: GitHub Repository Aanmaken

### 1.1 Ga naar GitHub
- Open https://github.com
- Log in met je account (of maak er een aan)

### 1.2 Nieuwe Repository Maken
1. Klik rechtsboven op het **+** icoon
2. Kies **New repository**
3. Vul in:
   - **Repository name**: `flowcommand` (of een andere naam)
   - **Description**: "Mission Control for N8N Fleet"
   - **Private**: Aanvinken (zodat alleen jij de code ziet)
4. **BELANGRIJK**: Vink NIETS aan bij "Initialize this repository"
5. Klik op **Create repository**

### 1.3 Kopieer de Repository URL
- Je ziet nu een pagina met commando's
- Kopieer de URL die lijkt op: `https://github.com/jouwgebruikersnaam/flowcommand.git`

---

## Stap 2: Lokaal Git Klaarmaken

### 2.1 Open PowerShell in je projectmap
1. Open File Explorer
2. Ga naar: `C:\Users\frank\.gemini\antigravity\scratch\flow-command`
3. Type in de adresbalk: `powershell` en druk op Enter

### 2.2 Voer deze commando's uit (één voor één):

```powershell
# Initialiseer Git (maakt een .git map aan)
git init

# Voeg alle bestanden toe (behalve die in .gitignore)
git add .

# Maak je eerste "commit" (snapshot van de code)
git commit -m "Initial commit: FlowCommand dashboard"

# Verander de standaard branch naam naar 'main'
git branch -M main

# Koppel je lokale project aan GitHub
# VERVANG DE URL HIERONDER MET JOUW GITHUB URL!
git remote add origin https://github.com/JOUWGEBRUIKERSNAAM/flowcommand.git

# Upload je code naar GitHub
git push -u origin main
```

**Let op:** Bij de eerste keer vragen ze mogelijk om je GitHub gebruikersnaam en wachtwoord/token.

---

## Stap 3: Productieserver Voorbereiden (Hostinger)

### 3.1 SSH Toegang tot je Server
```powershell
ssh jouwgebruikersnaam@jouwserver.hostinger.com
```

### 3.2 Installeer Docker (als nog niet gedaan)
```bash
# Update systeem
sudo apt update

# Installeer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installeer Docker Compose
sudo apt install docker-compose -y

# Voeg je gebruiker toe aan docker groep
sudo usermod -aG docker $USER

# Log opnieuw in zodat wijzigingen actief worden
exit
# SSH opnieuw in
```

### 3.3 Maak een map voor je project
```bash
mkdir -p ~/flowcommand
cd ~/flowcommand
```

---

## Stap 4: Code van GitHub naar Server Halen

### 4.1 Clone de Repository
```bash
cd ~/flowcommand
git clone https://github.com/JOUWGEBRUIKERSNAAM/flowcommand.git .
```

### 4.2 Maak de data map aan
```bash
mkdir -p data
```

### 4.3 Start de applicatie
```bash
docker-compose up -d --build
```

---

## Stap 5: Updates Deployen (Elke Keer als je Wijzigingen Hebt)

### Op je LOKALE computer (Windows):
```powershell
# Ga naar je projectmap
cd C:\Users\frank\.gemini\antigravity\scratch\flow-command

# Voeg je wijzigingen toe
git add .

# Maak een commit met een beschrijving
git commit -m "Beschrijving van je wijziging"

# Upload naar GitHub
git push
```

### Op je PRODUCTIESERVER (via SSH):
```bash
# Ga naar de projectmap
cd ~/flowcommand

# Haal de nieuwste versie op
git pull

# Herbouw en herstart de containers
docker-compose down
docker-compose up -d --build
```

---

## 🔧 Handige Commando's

### Lokaal (Windows PowerShell):
```powershell
# Status bekijken (welke bestanden zijn gewijzigd)
git status

# Geschiedenis bekijken
git log --oneline

# Wijzigingen ongedaan maken (voor commit)
git restore .
```

### Op de Server:
```bash
# Logs bekijken
docker-compose logs -f

# Containers stoppen
docker-compose down

# Containers starten
docker-compose up -d

# Container status
docker ps
```

---

## 🆘 Troubleshooting

### "Permission denied" bij git push
- Je moet mogelijk een Personal Access Token maken op GitHub:
  1. Ga naar GitHub → Settings → Developer settings → Personal access tokens
  2. Genereer een nieuwe token met "repo" rechten
  3. Gebruik deze token als wachtwoord

### Port 3000 is al in gebruik
```bash
# Vind het proces
sudo lsof -i :3000

# Stop het
sudo kill -9 [PROCESS_ID]
```

### Docker heeft geen rechten
```bash
sudo chmod 666 /var/run/docker.sock
```

---

## 📝 Opmerkingen
- De `data/instances.json` wordt NIET naar GitHub geüpload (staat in .gitignore)
- Dit betekent dat je je instances opnieuw moet toevoegen op de productieserver
- Alternatief: Kopieer `data/instances.json` handmatig met `scp`:
  ```powershell
  scp C:\Users\frank\.gemini\antigravity\scratch\flow-command\data\instances.json user@server:~/flowcommand/data/
  ```
