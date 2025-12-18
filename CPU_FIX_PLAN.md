# 🚨 CPU 100% FIX - URGENT

## Problem Identified

Je FlowCommand app gebruikt **98% CPU** op Hostinger omdat:

1. **Geen Caching** - Elke page load doet volledige N8N API calls
2. **Force Dynamic Rendering** - `revalidate = 0` betekent ALTIJD server-side render
3. **getAllWorkflows()** - Kan honderden workflows fetchen per request
4. **getExecutions(50)** - 50 executions per instance, per page load
5. **Multiple Instances** - Dit × aantal instances = CPU meltdown

## Immediate Fix Strategy

### FASE 1: EMERGENCY PATCH (5 minuten) ⚡
Stop de bleeding - implementeer basic caching

### FASE 2: PROPER CACHING (15 minuten) 🛠️
Implementeer Next.js caching strategies

### FASE 3: RATE LIMITING (10 minuten) 🔒
Voeg request throttling toe

## Implementation Steps

### Step 1: Change Revalidation Strategy

**File:** `app/page.tsx`

```typescript
// VOOR (SLECHT):
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// NA (GOED):
export const revalidate = 60; // Cache voor 60 seconden
// Verwijder: export const dynamic = 'force-dynamic';
```

### Step 2: Add Instance Status Caching

**File:** `lib/instance-cache.ts` (NIEUW)

```typescript
type CachedInstance = {
  data: any;
  timestamp: number;
};

const cache = new Map<string, CachedInstance>();
const CACHE_TTL = 30000; // 30 seconden

export function getCachedInstanceStatus(instanceId: string) {
  const cached = cache.get(instanceId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedInstanceStatus(instanceId: string, data: any) {
  cache.set(instanceId, {
    data,
    timestamp: Date.now()
  });
}
```

### Step 3: Update InstanceCard with Caching

**File:** `app/components/InstanceCard.tsx`

```typescript
import { getCachedInstanceStatus, setCachedInstanceStatus } from '@/lib/instance-cache';

async function getInstanceStatus(instance: N8nInstance) {
  // Check cache first
  const cached = getCached InstanceStatus(instance.id);
  if (cached) {
    return cached;
  }

  // ... rest of existing code ...
  
  // Cache result
  const result = { /* status data */ };
  setCachedInstanceStatus(instance.id, result);
  return result;
}
```

### Step 4: Reduce API Calls

**File:** `app/components/InstanceCard.tsx`

```typescript
// VOOR:
const [workflows, executions] = await Promise.all([
  client.getAllWorkflows(),    // ← 100+ workflows!
  client.getExecutions(50)     // ← 50 executions!
]);

// NA:
const [workflows, executions] = await Promise.all([
  client.getWorkflows(10),     // ← Alleen eerste 10
  client.getExecutions(5)      // ← Alleen laatste 5
]);
```

## Expected Results

### VOOR:
- CPU: 98%
- Requests per page load: 100+ API calls
- Response time: Slow
- Server: Melting 🔥

### NA:
- CPU: <10%
- Requests per page load: 0 (cached) of ~10 (fresh)
- Response time: Fast
- Server: Happy 😊

## Timeline

- **Step 1**: 2 min implementatie
- **Step 2**: 5 min nieuwe cache file
- **Step 3**: 5 min InstanceCard update
- **Step 4**: 3 min reduce API calls

**Total: 15 minuten** → Deploy → CPU Fixed! ✅

## Next Steps

1. Implementeer deze fixes
2. Deploy naar productie
3. Monitor CPU usage
4. Als nog steeds hoog → check logs voor infinite loops in NextAuth
