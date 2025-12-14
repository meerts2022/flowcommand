# Production Deployment Guide

## Problem: Add Instance Button Not Working

### Root Cause
The application stores instance configurations in `data/instances.json` file. In Docker production environments, the filesystem is read-only by default, preventing the app from saving new instances.

### Solution: Persistent Volume

We need to mount a persistent volume for the `/app/data` directory so instance data persists across container restarts and can be written to.

---

## For EasyPanel Deployment

### Step 1: Add Volume Mount

In EasyPanel, after creating your app:

1. Go to your `flowcommander` service
2. Navigate to the **"Mounts"** or **"Volumes"** tab (linksboven in het menu)
3. Click **"Add Mount"** or **"Add Volume"**
4. Configure:
   - **Mount Path**: `/app/data`
   - **Volume Name**: `flowcommand-data` (or let EasyPanel generate one)
   - **Type**: Volume (persistent)

### Step 2: Redeploy

After adding the volume mount:
1. Click **"Implementeren"** (Deploy) again
2. Wait for the deployment to complete

### Step 3: Test

1. Open your FlowCommand dashboard
2. Go to Settings
3. Try adding a new instance
4. It should now work! ✅

---

## For Docker Compose Deployment

The `docker-compose.yml` file has been updated with a volume mount:

```yaml
volumes:
  - flow-command-data:/app/data
```

Just run:

```bash
docker-compose down
docker-compose up -d --build
```

---

## Verification

To verify the volume is working, you can:

1. **Add an instance** via the Settings page
2. **Restart the container**: 
   - EasyPanel: Click the restart button
   - Docker Compose: `docker-compose restart`
3. **Check if the instance is still there** - if yes, the volume is working! ✅

---

## Troubleshooting

### Browser Console Shows Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when clicking "Add Instance"
4. Common errors:
   - `500 Internal Server Error` → Volume not mounted correctly
   - `EACCES` or `ENOENT` → Permission issues with data directory

### Check Container Logs

In EasyPanel:
1. Go to your service
2. Click on "Logboeken" (Logs)
3. Look for errors related to file operations

### Manual Fix (Last Resort)

If volumes don't work, you can:
1. SSH into your server
2. Find the container: `docker ps`
3. Exec into it: `docker exec -it <container-id> sh`
4. Check permissions: `ls -la /app/data`
5. Fix permissions if needed: `chmod 755 /app/data`

---

## Future Migration to Database

For production environments with multiple instances, consider migrating to a database:
- PostgreSQL
- MySQL
- MongoDB
- Or even SQLite (still file-based but more robust)

This would eliminate filesystem dependency completely.
