# NS1 DNS Configuration for shoprealestatespace.org

## Required DNS Records

Once your nameservers are updated to NS1, you'll need to configure these DNS records in your NS1 control panel:

### 1. A Records (IPv4 Address Records)
```
Name: @
Type: A
Value: 35.204.112.174
TTL: 300 (or default)
```

```
Name: www
Type: A
Value: 35.204.112.174
TTL: 300 (or default)
```

### 2. TXT Records (Text Records)
```
Name: @
Type: TXT
Value: mailerlite-domain-verification=a32abb8fd4e8ffae9c45fb90fb8a6b617310537c
TTL: 300 (or default)
```

## Additional Recommended Records

### 3. CNAME Record (for www subdomain - Alternative to www A record)
*Note: Use either the www A record OR this CNAME, not both*
```
Name: www
Type: CNAME
Value: shoprealestatespace.org
TTL: 300 (or default)
```

### 4. MX Records (if you plan to use email)
*Add these if you want to receive email at your domain*
```
Name: @
Type: MX
Priority: 10
Value: mail.shoprealestatespace.org
TTL: 300 (or default)
```

### 5. Additional Security Records (Recommended)

#### SPF Record (Email Security)
```
Name: @
Type: TXT
Value: v=spf1 include:_spf.google.com ~all
TTL: 300 (or default)
```

#### DMARC Record (Email Security)
```
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@shoprealestatespace.org
TTL: 300 (or default)
```

## Step-by-Step NS1 Setup Process

### 1. Access NS1 Control Panel
- Log into your NS1 account
- Navigate to "DNS" or "Zones"
- Add your domain: `shoprealestatespace.org`

### 2. Create Records
For each record above:
1. Click "Add Record" or "+"
2. Select the record type (A, TXT, CNAME, etc.)
3. Enter the name (@ means root domain)
4. Enter the value/target
5. Set TTL (Time To Live) - 300 seconds is good for testing
6. Save the record

### 3. Verification Steps
After setting up records, verify they're working:

#### Check A Record:
```bash
dig shoprealestatespace.org A
dig www.shoprealestatespace.org A
```

#### Check TXT Record:
```bash
dig shoprealestatespace.org TXT
```

#### Online Tools:
- Use DNS checker tools like whatsmydns.net
- Enter your domain and check different record types

## Important Notes

### TTL (Time To Live)
- Start with 300 seconds (5 minutes) for testing
- Once everything works, increase to 3600 (1 hour) or 86400 (24 hours)
- Lower TTL = faster changes but more DNS queries
- Higher TTL = slower changes but better performance

### Propagation Time
- DNS changes can take 24-48 hours to propagate globally
- Some locations may see changes faster than others
- Use DNS propagation checkers to monitor progress

### Testing Your Setup
1. **Website Access**: Try accessing both:
   - http://shoprealestatespace.org
   - http://www.shoprealestatespace.org

2. **MailerLite Verification**: 
   - The TXT record will allow MailerLite to verify domain ownership
   - Check your MailerLite dashboard for verification status

3. **SSL Certificate**:
   - If using HTTPS, you may need to configure SSL certificates
   - Many hosting providers offer free Let's Encrypt certificates

## Troubleshooting

### Common Issues:
1. **Records not resolving**: Check TTL and wait for propagation
2. **Website not loading**: Verify A record points to correct IP
3. **Email verification failing**: Ensure TXT record is exactly as specified

### DNS Propagation Checkers:
- whatsmydns.net
- dnschecker.org
- dns-lookup.com

## Next Steps After DNS Setup

1. **Verify all records are resolving correctly**
2. **Test website accessibility**
3. **Complete MailerLite domain verification**
4. **Set up SSL certificate if needed**
5. **Configure any additional services (email, subdomains, etc.)**

## Contact Information
If you encounter issues:
- Check NS1 documentation
- Use DNS testing tools
- Verify nameserver propagation first before troubleshooting DNS records