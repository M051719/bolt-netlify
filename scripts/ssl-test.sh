#!/bin/bash

# SSL Configuration Testing Script
# Tests SSL/TLS configuration for Cloudflare compatibility

set -e

DOMAIN=${1:-"localhost"}

echo "🔍 Testing SSL Configuration for: $DOMAIN"
echo "================================================"

# Test 1: Check OpenSSL version
echo "1️⃣ Checking OpenSSL version..."
openssl version
echo ""

# Test 2: Check supported cipher suites
echo "2️⃣ Checking ChaCha20-Poly1305 support..."
if openssl ciphers -v | grep -q CHACHA20; then
    echo "✅ ChaCha20-Poly1305 ciphers are supported"
    openssl ciphers -v | grep CHACHA20
else
    echo "❌ ChaCha20-Poly1305 ciphers not found"
fi
echo ""

# Test 3: Test SSL connection (if domain is not localhost)
if [ "$DOMAIN" != "localhost" ]; then
    echo "3️⃣ Testing SSL connection to $DOMAIN..."
    
    # Test TLS 1.3
    echo "Testing TLS 1.3..."
    if timeout 10 openssl s_client -connect $DOMAIN:443 -tls1_3 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "TLSv1.3"; then
        echo "✅ TLS 1.3 is supported"
    else
        echo "⚠️ TLS 1.3 not available (may not be enabled)"
    fi
    
    # Test TLS 1.2
    echo "Testing TLS 1.2..."
    if timeout 10 openssl s_client -connect $DOMAIN:443 -tls1_2 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "TLSv1.2"; then
        echo "✅ TLS 1.2 is supported"
    else
        echo "❌ TLS 1.2 not available"
    fi
    
    # Test cipher negotiation
    echo "Testing ChaCha20-Poly1305 cipher..."
    if timeout 10 openssl s_client -connect $DOMAIN:443 -cipher 'ECDHE-RSA-CHACHA20-POLY1305' -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "Cipher.*CHACHA20"; then
        echo "✅ ChaCha20-Poly1305 cipher negotiation successful"
    else
        echo "⚠️ ChaCha20-Poly1305 cipher not negotiated (may not be preferred)"
    fi
    
    echo ""
fi

# Test 4: Check web server configuration
echo "4️⃣ Checking web server configuration..."

# Check if Nginx is running
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "📋 Nginx is running"
    if nginx -t 2>/dev/null; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration has errors"
    fi
fi

# Check if Apache is running
if systemctl is-active --quiet apache2 2>/dev/null || systemctl is-active --quiet httpd 2>/dev/null; then
    echo "📋 Apache is running"
    if apache2ctl configtest 2>/dev/null || httpd -t 2>/dev/null; then
        echo "✅ Apache configuration is valid"
    else
        echo "❌ Apache configuration has errors"
    fi
fi

echo ""
echo "🎯 Recommendations:"
echo "1. Test your domain with SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "2. Verify A+ rating achievement"
echo "3. Check Cloudflare SSL/TLS settings are set to 'Full (strict)'"
echo "4. Enable HSTS in Cloudflare dashboard"
echo ""
echo "✅ SSL configuration testing complete!"