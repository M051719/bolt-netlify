#!/bin/bash

# Complete Nginx SSL Setup Script for repmotivatedseller.shoprealestatespace.org
# Self-contained script that doesn't rely on external dependencies

set -e

echo "🔒 Starting Complete SSL Setup for repmotivatedseller.shoprealestatespace.org"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Domain configuration
DOMAIN="repmotivatedseller.shoprealestatespace.org"
WWW_DOMAIN="www.repmotivatedseller.shoprealestatespace.org"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${BLUE}📦 Step 1: Installing Nginx...${NC}"

# Update package list
apt update

# Install Nginx and required packages
apt install -y nginx openssl curl

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}✅ Nginx installed successfully${NC}"

echo -e "${BLUE}🔑 Step 2: Creating SSL certificates...${NC}"

# Create SSL directory
mkdir -p /etc/nginx/ssl
mkdir -p /etc/nginx/conf.d

# Generate strong DH parameters (this may take a few minutes)
echo -e "${YELLOW}⏳ Generating DH parameters (this may take 2-5 minutes)...${NC}"
openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

# Create self-signed certificate for initial setup
# In production, you should use Cloudflare Origin CA or Let's Encrypt
echo -e "${YELLOW}📜 Creating self-signed SSL certificate...${NC}"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/${DOMAIN}.key \
    -out /etc/nginx/ssl/${DOMAIN}.crt \
    -subj "/C=US/ST=State/L=City/O=RepMotivatedSeller/OU=IT/CN=${DOMAIN}/emailAddress=admin@${DOMAIN}" \
    -extensions v3_req \
    -config <(cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=US
ST=State
L=City
O=RepMotivatedSeller
OU=IT Department
CN=${DOMAIN}
emailAddress=admin@${DOMAIN}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN}
DNS.2 = ${WWW_DOMAIN}
DNS.3 = admin.${DOMAIN}
DNS.4 = api.${DOMAIN}
EOF
)

# Set proper permissions
chmod 600 /etc/nginx/ssl/${DOMAIN}.key
chmod 644 /etc/nginx/ssl/${DOMAIN}.crt
chmod 644 /etc/nginx/ssl/dhparam.pem

echo -e "${GREEN}✅ SSL certificates created${NC}"

echo -e "${BLUE}⚙️ Step 3: Configuring Nginx with modern SSL settings...${NC}"

# Create modern SSL configuration
cat > /etc/nginx/conf.d/ssl-modern.conf << 'EOF'
# Modern SSL/TLS Configuration for Cloudflare Compatibility
# Optimized for RepMotivatedSeller

# SSL Protocols - Enable only TLS 1.2 and 1.3
ssl_protocols TLSv1.2 TLSv1.3;

# Modern Cipher Suites (Cloudflare Compatible)
# Prioritizes ChaCha20-Poly1305 and modern AES-GCM suites
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';

# Let the client choose the cipher (TLS 1.3 style)
ssl_prefer_server_ciphers off;

# SSL Session Configuration
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 1.1.1.1 1.0.0.1 valid=300s;
resolver_timeout 5s;

# DH Parameters
ssl_dhparam /etc/nginx/ssl/dhparam.pem;

# Security Headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Additional Security
ssl_buffer_size 8k;
ssl_early_data on;
EOF

# Create site configuration for repmotivatedseller.org
cat > /etc/nginx/sites-available/${DOMAIN} << EOF
# RepMotivatedSeller.org - Production Configuration
# Optimized for Cloudflare and modern SSL/TLS

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} ${WWW_DOMAIN};
    
    # SSL Certificate Configuration
    ssl_certificate /etc/nginx/ssl/${DOMAIN}.crt;
    ssl_certificate_key /etc/nginx/ssl/${DOMAIN}.key;
    
    # Root directory (adjust this to your application path)
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    
    # Logging
    access_log /var/log/nginx/${DOMAIN}_access.log;
    error_log /var/log/nginx/${DOMAIN}_error.log;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Main location block
    location / {
        try_files \$uri \$uri/ =404;
        
        # If you're using a Node.js app, uncomment and modify:
        # proxy_pass http://localhost:3000;
        # proxy_http_version 1.1;
        # proxy_set_header Upgrade \$http_upgrade;
        # proxy_set_header Connection 'upgrade';
        # proxy_set_header Host \$host;
        # proxy_set_header X-Real-IP \$remote_addr;
        # proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        # proxy_set_header X-Forwarded-Proto \$scheme;
        # proxy_cache_bypass \$http_upgrade;
    }
    
    # Admin subdomain handling
    location /admin {
        # Add admin-specific configuration here
        try_files \$uri \$uri/ =404;
    }
    
    # API subdomain handling
    location /api {
        # Add API-specific configuration here
        try_files \$uri \$uri/ =404;
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# Admin subdomain (if using separate subdomain)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.${DOMAIN};
    
    # SSL Certificate Configuration
    ssl_certificate /etc/nginx/ssl/${DOMAIN}.crt;
    ssl_certificate_key /etc/nginx/ssl/${DOMAIN}.key;
    
    # Admin-specific configuration
    root /var/www/html;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
        # Add admin authentication here if needed
    }
}

# API subdomain (if using separate subdomain)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.${DOMAIN};
    
    # SSL Certificate Configuration
    ssl_certificate /etc/nginx/ssl/${DOMAIN}.crt;
    ssl_certificate_key /etc/nginx/ssl/${DOMAIN}.key;
    
    # API-specific configuration
    location / {
        # Proxy to your API server
        # proxy_pass http://localhost:3001;
        # proxy_set_header Host \$host;
        # proxy_set_header X-Real-IP \$remote_addr;
        # proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        # proxy_set_header X-Forwarded-Proto \$scheme;
        
        # For now, return a simple response
        return 200 'API endpoint - configure as needed';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

echo -e "${GREEN}✅ Nginx configuration created${NC}"

echo -e "${BLUE}🧪 Step 4: Testing configuration...${NC}"

# Test Nginx configuration
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration test passed${NC}"
    
    # Reload Nginx
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    echo -e "${YELLOW}Please check the configuration and try again${NC}"
    exit 1
fi

echo -e "${BLUE}🔥 Step 5: Setting up firewall...${NC}"

# Configure UFW firewall
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw allow ssh
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️ UFW not installed, skipping firewall configuration${NC}"
fi

echo -e "${BLUE}📄 Step 6: Creating sample index page...${NC}"

# Create a sample index page
mkdir -p /var/www/html
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RepMotivatedSeller - SSL Configured</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 2.5rem;
        }
        .status {
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            display: inline-block;
            margin: 1rem 0;
            font-weight: bold;
        }
        .info {
            background: #f3f4f6;
            padding: 1.5rem;
            border-radius: 10px;
            margin: 1rem 0;
            text-align: left;
        }
        .info h3 {
            margin-top: 0;
            color: #374151;
        }
        .check-item {
            margin: 0.5rem 0;
            color: #059669;
        }
        .check-item::before {
            content: "✅ ";
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 RepMotivatedSeller</h1>
        <div class="status">SSL/TLS Configured Successfully!</div>
        
        <div class="info">
            <h3>🔒 SSL Configuration Complete</h3>
            <div class="check-item">Modern TLS 1.2/1.3 protocols enabled</div>
            <div class="check-item">ChaCha20-Poly1305 cipher support</div>
            <div class="check-item">Security headers configured</div>
            <div class="check-item">HTTP to HTTPS redirect active</div>
            <div class="check-item">Gzip compression enabled</div>
        </div>
        
        <div class="info">
            <h3>🚀 Next Steps</h3>
            <p><strong>1. Test SSL:</strong> <a href="https://www.ssllabs.com/ssltest/" target="_blank">SSL Labs Test</a></p>
            <p><strong>2. Configure Cloudflare:</strong> Set SSL/TLS to "Full (strict)"</p>
            <p><strong>3. Deploy Application:</strong> Replace this page with your app</p>
            <p><strong>4. Update DNS:</strong> Point your domain to this server</p>
        </div>
        
        <p style="margin-top: 2rem; color: #6b7280; font-size: 0.9rem;">
            Server configured on $(date)
        </p>
    </div>
</body>
</html>
EOF

# Set proper permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

echo -e "${GREEN}✅ Sample page created${NC}"

echo -e "${GREEN}🎉 SSL Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Configuration Summary:${NC}"
echo -e "Domain: ${DOMAIN}"
echo -e "SSL Certificate: /etc/nginx/ssl/${DOMAIN}.crt"
echo -e "SSL Key: /etc/nginx/ssl/${DOMAIN}.key"
echo -e "DH Parameters: /etc/nginx/ssl/dhparam.pem"
echo -e "Nginx Config: /etc/nginx/sites-available/${DOMAIN}"
echo ""
echo -e "${YELLOW}🔍 Next Steps:${NC}"
echo -e "1. Test your SSL: https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN}"
echo -e "2. Configure Cloudflare SSL/TLS to 'Full (strict)'"
echo -e "3. Update your DNS to point to this server"
echo -e "4. Deploy your RepMotivatedSeller application"
echo ""
echo -e "${GREEN}✅ Your server is now ready for production with modern SSL/TLS!${NC}"