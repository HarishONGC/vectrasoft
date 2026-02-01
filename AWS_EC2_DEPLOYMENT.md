# AWS EC2 Deployment Guide - CCTV Dashboard

Deploy frontend + backend + mediamtx on AWS EC2 (always-free eligible for 12 months).

---

## Step 1: Create AWS Account & Launch EC2

### 1.1 Sign Up for AWS
- Visit: https://aws.amazon.com/free/
- Create account (free tier includes 1 year of EC2 t2.micro)

### 1.2 Launch EC2 Instance
1. Login to AWS Console
2. Go to **EC2** → **Instances** → **Launch instances**
3. Configure:
   - **Name**: `cctv-dashboard`
   - **AMI**: Ubuntu 22.04 LTS (free tier eligible)
   - **Instance type**: `t2.micro` (free tier)
   - **Key pair**: Create new → Download `.pem` file (save it!)
   - **Network**: Default VPC
   - **Storage**: 20 GB (free tier includes 30 GB)
   - **Security group**: Create new, allow:
     - SSH (port 22) from your IP
     - HTTP (port 80) from 0.0.0.0/0
     - HTTPS (port 443) from 0.0.0.0/0
     - Custom TCP 8554, 8888, 8889 from 0.0.0.0/0

4. Click **Launch instance**
5. Note the **Public IPv4 address** (e.g., `54.123.45.67`)

---

## Step 2: Connect via SSH (Windows)

### 2.1 Using PowerShell
```powershell
# Convert .pem to .ppk (one-time)
# Option: Use PuTTYgen (https://www.puttygen.com/) to convert

# Or use WSL:
$keyPath = "C:\path\to\cctv-key.pem"
$publicIP = "54.123.45.67"

ssh -i $keyPath ubuntu@$publicIP
```

### 2.2 Using GitBash / WSL
```bash
chmod 600 ~/cctv-key.pem
ssh -i ~/cctv-key.pem ubuntu@54.123.45.67
```

Replace IP with your public IPv4 address.

---

## Step 3: Install Docker on EC2

Once connected via SSH (on the EC2 instance):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Verify
docker --version
docker-compose --version
```

---

## Step 4: Clone Repository on EC2

```bash
cd /home/ubuntu

# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/CCTV_Dashboard_v6.git
cd CCTV_Dashboard_v6

# Or copy from your PC via SCP (from your local PC):
# scp -i "C:\path\to\cctv-key.pem" -r "C:\python\CCTV_Dashboard_v6\*" ubuntu@54.123.45.67:/home/ubuntu/CCTV_Dashboard_v6/
```

---

## Step 5: Configure Environment

On the EC2 instance:

```bash
cd ~/CCTV_Dashboard_v6

# Copy template
cp .env.production .env

# Edit with nano
nano .env
```

Update values:
```env
DB_PASSWORD=YourSecurePassword123!
DB_NAME=vms
CORS_ORIGIN=https://vectrasoftsolutions.com
VITE_API_BASE_URL=/api
VITE_WS_URL=https://vectrasoftsolutions.com
```

Save: `Ctrl+X` → `Y` → `Enter`

---

## Step 6: Build & Start Docker Compose

On EC2:

```bash
cd ~/CCTV_Dashboard_v6

# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Expected output (all Up):
```
NAME                 STATUS
cctv-db              Up (healthy)
cctv-backend         Up
cctv-frontend        Up
cctv-mediamtx        Up
```

---

## Step 7: Point Domain to EC2

### 7.1 Get Elastic IP (optional but recommended)
EC2 public IP can change. Assign **Elastic IP**:

1. AWS Console → **EC2** → **Elastic IPs**
2. Click **Allocate Elastic IP address**
3. Select your instance
4. Note the IP (it won't change)

### 7.2 Update DNS at Registrar
1. Go to your **domain registrar** (GoDaddy, Namecheap, etc.)
2. Update **A record**:
   - **Host**: `@` (or your subdomain)
   - **Value**: Your EC2 Elastic IP (e.g., `54.123.45.67`)
   - **TTL**: 3600

Wait 5-15 minutes for DNS propagation.

### 7.3 Test
```
https://vectrasoftsolutions.com  <- Frontend
https://vectrasoftsolutions.com:8888/kesanapalli-01/index.m3u8  <- HLS
```

---

## Step 8: (Optional) Set Up HTTPS with Caddy

On EC2:

```bash
# Install Caddy
sudo apt install caddy -y

# Create Caddyfile
sudo nano /etc/caddy/Caddyfile
```

Paste (replace domain):
```
vectrasoftsolutions.com {
  reverse_proxy localhost
  encode gzip
}
```

Start:
```bash
sudo systemctl start caddy
sudo systemctl enable caddy
```

Test: `https://vectrasoftsolutions.com` (HTTPS auto-enabled!)

---

## Step 9: Keep Running

All services run in background via Docker.

### View logs anytime:
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f mediamtx
```

### Restart services:
```bash
docker-compose restart
docker-compose restart backend
```

### Stop all:
```bash
docker-compose down
```

### Update code:
```bash
git pull origin main
docker-compose build
docker-compose up -d
```

---

## Step 10: Maintenance

### SSH back in:
```powershell
ssh -i "C:\path\to\cctv-key.pem" ubuntu@YOUR_ELASTIC_IP
```

### Check disk usage:
```bash
df -h
docker system df
```

### Database backup:
```bash
docker-compose exec db mysqldump -u root -p$DB_PASSWORD vms > backup.sql
```

### Monitor costs:
AWS free tier: 1 year free, then ~$3-8/month for t2.micro + storage.

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs <service-name>
```

### Can't SSH
- Check security group allows port 22 from your IP
- Verify `.pem` file permissions: `chmod 600 cctv-key.pem`

### Domain not resolving
```bash
nslookup vectrasoftsolutions.com
# Should return your Elastic IP
```

### Backend API not working
```bash
curl http://localhost:4000/api/
# Should respond with JSON
```

### Mediamtx not connecting
- Check RTSP URLs in `streaming/mediamtx.docker.yml`
- Verify cameras are reachable from AWS network

---

## Success Checklist

- [x] AWS account created
- [x] EC2 instance launched (t2.micro, Ubuntu 22.04)
- [x] SSH connected
- [x] Docker installed
- [x] Repository cloned
- [x] `.env` configured with secure password & domain
- [x] Security group allows ports 80, 443, 8554, 8888, 8889
- [x] `docker-compose build && docker-compose up -d` running
- [x] Frontend accessible at public URL
- [x] Domain pointed to Elastic IP
- [x] HTTPS configured with Caddy (optional)

---

## Cost Summary

**AWS Free Tier (12 months):**
- EC2 t2.micro: Free
- EBS Storage 30 GB: Free
- Data transfer (within limits): Free

**After 12 months:**
- t2.micro: ~$8/month
- EBS 20 GB: ~$2/month
- **Total: ~$10/month**

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `docker-compose ps` | List running containers |
| `docker-compose logs -f` | View real-time logs |
| `docker-compose restart` | Restart all services |
| `docker-compose down` | Stop all services |
| `docker system prune` | Clean up unused images |
| `ssh -i key.pem ubuntu@IP` | SSH into instance |
