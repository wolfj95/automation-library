# Deployment Alternatives (Non-Vercel)

This guide covers several ways to deploy your Student Automation Library to production without using Vercel.

## Option 1: Netlify (Easiest Alternative)

Netlify is very similar to Vercel and works great with Next.js.

### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build your app**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Configure Custom Subdomain**:
   - Go to Netlify dashboard > Domain settings
   - Add your custom subdomain (e.g., `automations.yourdomain.com`)
   - Add a CNAME record in your DNS provider pointing to Netlify

5. **Set Environment Variables**:
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Pros:
- Free tier available
- Automatic deployments from Git
- Easy custom domain setup
- Similar workflow to Vercel

### Cons:
- Requires Netlify account

---

## Option 2: DigitalOcean App Platform

DigitalOcean offers a platform-as-a-service similar to Vercel/Netlify.

### Steps:

1. **Push code to GitHub** (if not already there)

2. **Create DigitalOcean App**:
   - Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository
   - Select the branch to deploy

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Run Command: `npm start`

4. **Set Environment Variables**:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Configure Custom Domain**:
   - In DigitalOcean dashboard, add your subdomain
   - Update your DNS with the provided CNAME record

### Pricing:
- Starting at $5/month (Basic tier)

### Pros:
- Full control over infrastructure
- Integrated with DigitalOcean ecosystem
- Good documentation

### Cons:
- Costs money (no free tier for apps)

---

## Option 3: Self-Hosting on VPS (Maximum Control)

Host on your own server using a VPS provider like DigitalOcean, Linode, or Hetzner.

### Prerequisites:
- A VPS running Ubuntu 22.04 or similar
- SSH access to your server
- Your domain's DNS access

### Steps:

#### 1. Set up your VPS

SSH into your server:
```bash
ssh root@your-server-ip
```

Install Node.js and PM2:
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (web server)
sudo apt update
sudo apt install nginx
```

#### 2. Deploy Your Application

Clone your repository:
```bash
cd /var/www
git clone https://github.com/yourusername/automation-library.git
cd automation-library
```

Install dependencies:
```bash
npm install
```

Create `.env.local`:
```bash
nano .env.local
```

Add your environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Build the application:
```bash
npm run build
```

#### 3. Run with PM2

Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

Add this configuration:
```javascript
module.exports = {
  apps: [{
    name: 'automation-library',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/automation-library',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start the application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx as Reverse Proxy

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/automation-library
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name automations.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/automation-library /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Set Up SSL with Let's Encrypt

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
sudo certbot --nginx -d automations.yourdomain.com
```

Follow the prompts to configure HTTPS.

#### 6. Configure DNS

In your domain's DNS settings, add:
```
Type: A
Name: automations
Value: your-server-ip
TTL: 3600
```

### Updating Your App

To deploy updates:
```bash
cd /var/www/automation-library
git pull
npm install
npm run build
pm2 restart automation-library
```

### Pros:
- Full control over everything
- Can be very cost-effective ($5-10/month for a small VPS)
- Learn valuable DevOps skills
- No vendor lock-in

### Cons:
- More complex setup
- You're responsible for security, updates, and maintenance
- Requires some Linux/server knowledge

---

## Option 4: Railway

Railway is a modern deployment platform with a generous free tier.

### Steps:

1. **Sign up at [Railway](https://railway.app)**

2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

3. **Login**:
   ```bash
   railway login
   ```

4. **Initialize and Deploy**:
   ```bash
   railway init
   railway up
   ```

5. **Set Environment Variables**:
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

6. **Configure Custom Domain**:
   - In Railway dashboard, go to your project settings
   - Add custom domain: `automations.yourdomain.com`
   - Update your DNS with the provided CNAME

### Pros:
- $5 free credit per month
- Very simple deployment
- Good developer experience
- Automatic HTTPS

### Cons:
- Free tier has limitations
- Relatively new platform

---

## Option 5: Docker + Any Cloud Provider

Package your app as a Docker container for maximum portability.

### Create Dockerfile

Create `Dockerfile` in your project root:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Create `.dockerignore`:
```
node_modules
.next
.git
.env.local
```

Update `next.config.js` to enable standalone output:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Build and Deploy

Build the image:
```bash
docker build -t automation-library .
```

Then deploy to any platform:
- **DigitalOcean Droplet**: Upload and run with Docker
- **AWS ECS/Fargate**: Deploy as container
- **Google Cloud Run**: Serverless containers
- **Render**: Container-based hosting

---

## Recommendation

Based on your needs:

1. **If you want simplicity**: Use **Railway** or **Netlify**
   - Quick setup, free or cheap
   - Good for getting started fast

2. **If you want control and learning**: Use **VPS with PM2/Nginx**
   - Full control over infrastructure
   - Cost-effective long-term
   - Great learning experience

3. **If you want portability**: Use **Docker**
   - Can deploy anywhere
   - Easy to migrate between providers

For a classroom project with a custom subdomain, I'd recommend starting with **Railway** (easiest) or **self-hosting on a VPS** (most educational and cost-effective).

---

## DNS Configuration (All Options)

Regardless of which option you choose, you'll need to configure DNS:

1. Log into your domain provider (e.g., Namecheap, Google Domains, Cloudflare)
2. Add a DNS record:
   - **For most platforms (Railway, Netlify, etc.)**: Add a CNAME record
     - Type: `CNAME`
     - Name: `automations` (or your subdomain)
     - Value: `[provided by platform]` (e.g., `your-app.railway.app`)

   - **For VPS self-hosting**: Add an A record
     - Type: `A`
     - Name: `automations`
     - Value: `your-server-ip`

3. Wait for DNS propagation (can take 5 minutes to 48 hours)

---

## Security Checklist

Before going live, ensure:

- [ ] Environment variables are set correctly
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Supabase RLS policies are properly configured
- [ ] HTTPS/SSL is enabled
- [ ] Database connection is secure
- [ ] Consider rate limiting for API routes (future enhancement)

---

## Need Help?

If you run into issues:
1. Check application logs
2. Verify environment variables are loaded
3. Test database connection from the deployed environment
4. Check DNS propagation: https://dnschecker.org
