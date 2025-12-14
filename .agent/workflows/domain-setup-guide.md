---
description: Domain Setup Guide for FlowCommand
---

# 🌐 FlowCommand Domain Setup Guide

## Quick Reference - Wat we nodig hebben

### Info die we verzamelen:
- [ ] **Gekozen domein/subdomain**: _________________
- [ ] **VPS IP adres**: _________________
- [ ] **Huidige EasyPanel URL**: _________________

---

## DNS Configuratie Opties

### Optie 1: Subdomain (Aanbevolen)
**Voorbeeld**: `flow.jouwdomein.nl` of `flowcommand.jouwdomein.nl`

**A Record in Hostinger DNS:**
```
Type: A
Name: flow (of flowcommand)
Value: [VPS IP adres]
TTL: 3600
```

**Voordelen:**
✅ Geen extra domein kopen
✅ Gebruik bestaand domein
✅ Professioneel
✅ Makkelijk meerdere services te hosten

### Optie 2: Hoofddomein
**Voorbeeld**: `flowcommand.nl`

**A Record in Hostinger DNS:**
```
Type: A
Name: @ (of leeglaten)
Value: [VPS IP adres]
TTL: 3600
```

---

## Stappen Checklist

### STAP 1: DNS Record Aanmaken in Hostinger
1. [ ] Log in op Hostinger
2. [ ] Ga naar je domein
3. [ ] Klik op **DNS / Name Servers**
4. [ ] Klik **Add Record**
5. [ ] Kies **A Record**
6. [ ] Vul gegevens in (zie boven)
7. [ ] Klik **Save**
8. [ ] Wacht 5-15 minuten voor DNS propagatie

### STAP 2: Domein Koppelen in EasyPanel
1. [ ] Open EasyPanel dashboard
2. [ ] Ga naar FlowCommand app
3. [ ] Klik op **Domains** tab
4. [ ] Klik **Add Domain**
5. [ ] Voer domein in (bijv. `flow.jouwdomein.nl`)
6. [ ] Schakel **SSL** in (Let's Encrypt)
7. [ ] Klik **Save**
8. [ ] Wacht 2-10 minuten voor SSL certificaat

### STAP 3: Verificatie
1. [ ] Open `https://flow.jouwdomein.nl` in browser
2. [ ] Controleer of SSL certificaat geldig is (groene slot 🔒)
3. [ ] Test of FlowCommand dashboard laadt

---

## VPS IP Adres Vinden

### In Hostinger VPS Panel:
1. Log in op hPanel
2. Ga naar **VPS** sectie
3. Klik op je VPS
4. IP adres staat bovenaan → **noteer dit!**

### In EasyPanel:
1. Log in op EasyPanel
2. Ga naar **Settings**
3. IP adres staat bij **Server Info**

---

## Troubleshooting

### DNS werkt niet na 15 minuten
**Check:**
- Is A Record correct ingevoerd?
- Is TTL niet te lang? (3600 is goed)
- Test met: `nslookup flow.jouwdomein.nl`

### SSL certificaat faalt
**Oplossing:**
- Wacht nog 5 minuten
- Check of DNS al gepropageerd is
- Verwijder domein in EasyPanel en voeg opnieuw toe

### "This site can't be reached"
**Check:**
- DNS propagatie (kan tot 24 uur duren, meestal < 15 min)
- VPS IP adres correct?
- Firewall op VPS blokkeert port 80/443?

---

## Na Succesvolle Setup

**Je definitieve URLs worden:**
```
Development:  http://localhost:3000
Production:   https://cto360.nl
```

**Deze URLs gebruik je straks in:**
- ✅ Google OAuth Callback URLs
- ✅ NEXTAUTH_URL environment variable
- ✅ CORS settings (als nodig)

---

## Google OAuth Preview (na domain setup)

**Authorized JavaScript origins:**
```
http://localhost:3000
https://cto360.nl
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://cto360.nl/api/auth/callback/google
```

✅ **Klaar voor volgende stap!**
