# Cloudflare Tunnel - Quick Deploy (5 minutes)

## Simplest Free Hosting: Cloudflare Tunnel

Your PC runs the app, Cloudflare exposes it publicly. No VM needed, always free.

---

## Step 1: Install Cloudflare CLI (Windows)

```powershell
# Option A: Using winget (recommended)
winget install Cloudflare.cloudflared

# Option B: Download directly
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/
# Download cloudflared.exe and add to PATH
```

Verify:
```powershell
cloudflared --version
```

---

## Step 2: Login to Cloudflare

```powershell
cloudflared tunnel login
```

This opens your browser → **select your domain** (or create free domain on Cloudflare) → authorize.

---

## Step 3: Create Tunnel

```powershell
cloudflared tunnel create cctv-dashboard
```

Output:
```
Tunnel credentials written to C:\Users\...\cloudflared\cctv-dashboard.json
Tunnel ID: abc123xyz789
```

Save the Tunnel ID.

---

## Step 4: Configure Tunnel (config.yml)

Create file: `C:\Users\YourUsername\.cloudflared\config.yml`

```yaml
tunnel: cctv-dashboard
credentials-file: C:\Users\YourUsername\.cloudflared\cctv-dashboard.json

ingress:
  - hostname: vectrasoftsolutions.com
    service: http://localhost
  - hostname: hls.vectrasoftsolutions.com
    service: http://localhost:8888
  - hostname: rtsp.vectrasoftsolutions.com
    service: http://localhost:8554
  - service: http_status:404
```

Your domain is already set to `vectrasoftsolutions.com`.

---

## Step 5: Run Your App Locally (Terminal 1)

```powershell
cd C:\python\CCTV_Dashboard_v6

# Build backend
cd backend
npm run build
npm start

# In another terminal
cd C:\python\CCTV_Dashboard_v6\frontend
npm run build
npm run preview
```

Or use Docker locally:
```powershell
cd C:\python\CCTV_Dashboard_v6
docker-compose up
```

Wait for all services to start (DB, backend on 4000, frontend on 80, mediamtx on 8888/8554).

---

## Step 6: Start Cloudflare Tunnel (Terminal 2)

```powershell
cloudflared tunnel run cctv-dashboard
```

Output:
```
Serving <hostname> over HTTPS
Registered routes...
```

---

## Step 7: Access Your App

**Frontend:**
- https://vectrasoftsolutions.com

**HLS Streaming:**
- https://hls.vectrasoftsolutions.com:8888/kesanapalli-01/index.m3u8

**RTSP:**
- rtsp://rtsp.vectrasoftsolutions.com:8554/kesanapalli-01

---

## Step 8: Set DNS on Cloudflare Console (One-time)

1. Go to Cloudflare Dashboard → **DNS**
2. Add **CNAME records**:
  - Name: `vectrasoftsolutions.com` → Points to tunnel
  - Name: `hls.vectrasoftsolutions.com` → Points to tunnel
  - Name: `rtsp.vectrasoftsolutions.com` → Points to tunnel

Cloudflare auto-routes them to your PC via the tunnel.

---

## Keep Running

- **Terminal 1**: Your app (backend + frontend + mediamtx)
- **Terminal 2**: Cloudflare tunnel (`cloudflared tunnel run cctv-dashboard`)

Keep both running. PC must stay on for public access.

---

## Troubleshooting

### Tunnel won't connect
```powershell
# Re-login
cloudflared tunnel login

# Re-create tunnel
cloudflared tunnel delete cctv-dashboard
cloudflared tunnel create cctv-dashboard
```

### Domain not working
- Wait 5 min for DNS propagation
- Check Cloudflare DNS settings
- Verify `config.yml` syntax

### Can't access backend API
- Frontend must use `/api` (Cloudflare routes to localhost/api)
- Check backend CORS allows Cloudflare domain

---

## Done ✓

Your app is now public via Cloudflare Tunnel. Share the URL: https://vectrasoftsolutions.com

**Cost:** Free (Cloudflare free tier)  
**Downtime:** Only when your PC is off

Need to stop? Just close Terminal 2 (Cloudflare tunnel).
