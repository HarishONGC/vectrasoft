# CCTV Dashboard - Oracle Cloud Free VM Deployment Guide

## Step 1: Create Oracle Cloud Always-Free VM

### 1.1 Sign up for Oracle Cloud
- Visit: https://www.oracle.com/cloud/free/
- Create account (always-free tier includes 1 VM permanently)

### 1.2 Create Compute Instance
1. Login to Oracle Cloud Console
2. Navigate to **Compute** → **Instances**
3. Click **Create Instance**
4. Configure:
   - **Name**: `cctv-dashboard`
   - **Image**: Ubuntu 22.04 LTS
   - **Shape**: Always-Free eligible (ARM or AMD)
   - **Network**: Create new VCN (Virtual Cloud Network)
   - **SSH Key Pair**: 
     - Generate new key pair
     - Save private key (e.g., `cctv-key.key`)
     - Keep it safe

5. Click **Create**
6. Note the **Public IP Address** (e.g., `203.0.113.45`)

---

## Step 2: Connect to VM via SSH

### 2.1 On Windows (PowerShell)
```powershell
# Set private key permissions (first time only)
icacls "C:\path\to\cctv-key.key" /inheritance:r /grant:r "%USERNAME%:F"

# Connect to VM
ssh -i "C:\path\to\cctv-key.key" ubuntu@203.0.113.45
```

Replace `203.0.113.45` with your public IP.

### 2.2 On Linux/Mac
```bash
chmod 600 ~/cctv-key.key
ssh -i ~/cctv-key.key ubuntu@203.0.113.45
```

---

## Step 3: Install Docker & Docker Compose on VM

Once connected via SSH, run on the VM:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add ubuntu user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker ubuntu

# Apply group changes
newgrp docker

# Verify
docker --version
docker-compose --version
```

---

## Step 4: Clone Your Repository on VM

```bash
# Clone the repo (use HTTPS or SSH)
git clone https://github.com/YOUR_USERNAME/CCTV_Dashboard_v6.git
cd CCTV_Dashboard_v6

# Or if using SSH:
# git clone git@github.com:YOUR_USERNAME/CCTV_Dashboard_v6.git
```

If not on GitHub yet, you can:
- SCP files from local PC:
  ```bash
  scp -i "C:\path\to\cctv-key.key" -r "C:\python\CCTV_Dashboard_v6" ubuntu@203.0.113.45:/home/ubuntu/
  ```

---

## Step 5: Configure Environment Variables

On the VM:

```bash
cd ~/CCTV_Dashboard_v6

# Copy the template
cp .env.production .env

# Edit for production
nano .env
```

Update with secure values:
```env
DB_PASSWORD=YourSecurePassword123!
DB_NAME=vms
CORS_ORIGIN=http://203.0.113.45,http://yourdomain.com
VITE_API_BASE_URL=/api
VITE_WS_URL=http://203.0.113.45
```

- Replace `203.0.113.45` with your **public IP**
- If using **domain name**, replace IP with domain (e.g., `https://yourdomain.com`)
- Set strong `DB_PASSWORD` (use `openssl rand -base64 16` to generate)

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## Step 6: Configure Oracle Cloud Firewall

On VM (SSH terminal):

```bash
# List security lists
sudo iptables -L -n

# Or use firewall-cmd if available
sudo apt install firewalld -y
sudo systemctl start firewalld
```

Then in **Oracle Cloud Console**:

1. Navigate to **Networking** → **Virtual Cloud Networks** → Your VCN
2. Click your **Subnet**
3. Under **Security Lists**, click the default one
4. Click **Add Ingress Rules**

Add these rules (one per rule):
| Protocol | Source | Destination Port |
|----------|--------|------------------|
| TCP | 0.0.0.0/0 | 80 (HTTP) |
| TCP | 0.0.0.0/0 | 443 (HTTPS - if using Caddy) |
| TCP | 0.0.0.0/0 | 8554 (RTSP) |
| TCP | 0.0.0.0/0 | 8888 (HLS) |
| TCP | 0.0.0.0/0 | 8889 (WebRTC) |
| UDP | 0.0.0.0/0 | 8189 (WebRTC ICE) |

---

## Step 7: Build and Start Docker Compose

On VM (in the repo directory):

```bash
# Build images (backend & frontend)
docker-compose build

# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Expected output:
```
NAME                        STATUS
cctv-db                     Up (healthy)
cctv-backend                Up
cctv-frontend               Up
cctv-mediamtx               Up
cctv-ffmpeg-kesanapalli-01  Up
cctv-ffmpeg-kesanapalli-04  Up
```

---

## Step 8: Access Your Dashboard

### Frontend (HTTP)
- **URL**: `http://203.0.113.45`
- Replace IP with your **public IP** or **domain**

### HLS Streaming
- **Camera Stream**: `http://203.0.113.45:8888/kesanapalli-01/index.m3u8`

### WebRTC (Low-latency)
- **URL**: `http://203.0.113.45:8889/kesanapalli-01/whep`

### Backend API
- **URL**: `http://203.0.113.45/api/health` (or `/api/` endpoint)

---

## Step 9: (Optional) Set Up Custom Domain with HTTPS

### 9.1 Point Domain to Oracle IP

1. Go to your **domain registrar** (GoDaddy, Namecheap, etc.)
2. Edit DNS records
3. Add **A record**:
   - **Host**: `@` (or your subdomain)
   - **Value**: `203.0.113.45` (your Oracle VM IP)
   - **TTL**: 3600
4. Wait 5-15 minutes for DNS to propagate

### 9.2 Install Caddy for HTTPS (on VM)

```bash
# Install Caddy
sudo apt install caddy -y

# Stop default caddy
sudo systemctl stop caddy

# Create Caddy config
sudo nano /etc/caddy/Caddyfile
```

Paste this config (replace `yourdomain.com` with your domain):
```
yourdomain.com {
  reverse_proxy localhost:80
  encode gzip
}
```

Start Caddy:
```bash
sudo systemctl start caddy
sudo systemctl enable caddy
```

### 9.3 Update .env for HTTPS

On VM:
```bash
nano .env
```

Update:
```env
CORS_ORIGIN=https://yourdomain.com
VITE_WS_URL=https://yourdomain.com
VITE_API_BASE_URL=/api
```

Restart containers:
```bash
docker-compose up -d
```

Access via: `https://yourdomain.com`

---

## Step 10: Maintenance & Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mediamtx
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop All
```bash
docker-compose down
```

### Update Code
```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### Database Backup
```bash
docker-compose exec db mysqldump -u root -p$DB_PASSWORD vms > backup.sql
```

### Check Disk Space
```bash
df -h
docker system df
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs <service-name>
# Check specific error
```

### Database connection error
```bash
# Verify DB is running
docker-compose exec db mysql -u root -p$DB_PASSWORD -e "SHOW DATABASES;"
```

### Mediamtx not connecting to cameras
```bash
# Check mediamtx logs
docker-compose logs mediamtx

# Verify RTSP URLs in mediamtx.docker.yml
cat streaming/mediamtx.docker.yml | grep "source:"
```

### Port already in use
```bash
# Change port in docker-compose.yml
# e.g., "9000:4000" instead of "4000:4000"
```

### Out of memory on free tier
- Reduce HLS segment count in mediamtx config
- Stop unnecessary services
- Use `docker system prune` to clean up

---

## Success Checklist

- [x] Oracle Cloud VM created & accessible via SSH
- [x] Docker & Docker Compose installed
- [x] Repository cloned on VM
- [x] `.env` file configured with DB password & domain
- [x] Oracle firewall rules added
- [x] `docker-compose build && docker-compose up -d` running successfully
- [x] Frontend accessible at public URL
- [x] Camera streams working (HLS/WebRTC)
- [x] (Optional) Domain & HTTPS configured
