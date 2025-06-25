# RepMotivatedSeller - Foreclosure Assistance Platform

A comprehensive real estate platform with foreclosure assistance questionnaire, admin dashboard, automated notifications, and CRM integration.

## 🚀 Features

### 📋 Foreclosure Questionnaire
- **Multi-step SPIN methodology** questionnaire
- **Contact information collection** with privacy protection
- **Situation assessment** with financial details
- **Problem identification** and impact analysis
- **Solution planning** and need-payoff questions
- **Real-time form validation** and progress tracking

### 🎛️ Enhanced Admin Dashboard
- **Real-time statistics** and submission overview
- **Advanced filtering** by status, date, urgency, and search terms
- **Priority-based organization** (high/medium/low urgency)
- **Status management** with notes and assignment tracking
- **CSV export** functionality for external analysis
- **Notification settings** management interface
- **Responsive design** for mobile and desktop

### 📧 Comprehensive Email Automation

#### **MailerLite Integration**
- **Professional email service** with high deliverability
- **Automated list management** and segmentation
- **Email tracking** (opens, clicks, bounces)
- **Custom field mapping** for personalized emails
- **Automation sequences** and drip campaigns

#### **Email Types**
1. **New Submission Alerts** - Instant notifications to admin team
2. **Urgent Case Notifications** - Special alerts for high-priority situations
3. **Status Update Emails** - Automated client notifications
4. **Follow-up Reminders** - Scheduled reminders at 1, 3, 7, and 14 days
5. **Welcome Sequences** - Automated client onboarding emails

#### **Smart Priority Detection**
- **High Priority**: NOD received, 3+ missed payments, or client overwhelmed
- **Medium Priority**: 1-2 missed payments
- **Low Priority**: Anticipating trouble, proactive inquiries

### 🔗 Advanced CRM Integration

#### **Supported CRM Systems**
- **HubSpot** (full integration with contacts, activities, and custom properties)
- **Salesforce** (configurable with custom field mapping)
- **Pipedrive** (deal and contact management)
- **Custom CRM** (webhook-based integration)

#### **CRM Features**
- **Automatic lead creation** with comprehensive data mapping
- **Contact synchronization** with submission details
- **Activity logging** for all interactions and status changes
- **Urgency level tracking** and lead scoring
- **Custom field mapping** for your specific CRM setup
- **Event tracking** for email opens, clicks, and responses

### 🔔 Multi-Channel Notifications

#### **Email Notifications** (MailerLite)
- Professional HTML templates with responsive design
- Branded emails with company logo and styling
- Automatic list segmentation by urgency and status
- Email tracking and analytics

#### **SMS Notifications** (Twilio Integration)
- Urgent case alerts via SMS
- High-priority notifications for immediate attention
- Configurable recipient lists

#### **Slack Integration**
- Real-time notifications to team channels
- Customizable message formatting
- Integration with Slack workflows

### 🤖 Automated Follow-up System
- **Scheduled reminders** at 1, 3, 7, and 14 days
- **Automatic escalation** for unresponded cases
- **Customizable follow-up schedules**
- **Progress tracking** and completion monitoring

### 🔐 Security & Authentication
- **Supabase authentication** with email/password
- **Row Level Security (RLS)** for data protection
- **Admin role management** with proper permissions
- **Secure API key management** via environment variables
- **Data encryption** and privacy compliance

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Email Service**: MailerLite (primary), Resend (fallback)
- **CRM Integration**: HubSpot, Salesforce, Pipedrive, Custom APIs
- **SMS Service**: Twilio (optional)
- **Notifications**: Slack webhooks (optional)
- **Deployment**: Netlify/Vercel compatible

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rep-motivated-seller
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration values (see Configuration section below).

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `/supabase/migrations/`
   - Deploy the edge functions in `/supabase/functions/`

5. **Start development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### 🔧 Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# MailerLite Configuration
MAILERLITE_API_KEY=your_mailerlite_api_key
FROM_EMAIL=noreply@repmotivatedseller.org

# Email Recipients
ADMIN_EMAIL=admin@repmotivatedseller.org
URGENT_EMAIL=urgent@repmotivatedseller.org
MANAGER_EMAIL=manager@repmotivatedseller.org

# Site Configuration
SITE_URL=https://your-domain.com
```

### 📧 MailerLite Setup

1. **Create MailerLite Account**
   - Sign up at [MailerLite.com](https://www.mailerlite.com)
   - Get your API key from Settings > Developer API

2. **Configure Groups**
   - The system automatically creates these groups:
     - `new_leads` - All new submissions
     - `urgent_cases` - High-priority cases
     - `foreclosure_clients` - All foreclosure clients

3. **Set up Automation**
   - Create welcome sequence automation
   - Set up follow-up email sequences
   - Configure abandoned form recovery

### 🔗 CRM Integration Setup

#### **HubSpot Integration**
```bash
# HubSpot Configuration
CRM_TYPE=hubspot
HUBSPOT_API_KEY=your_hubspot_api_key
HUBSPOT_OWNER_ID=your_hubspot_owner_id
```

#### **Salesforce Integration**
```bash
# Salesforce Configuration
CRM_TYPE=salesforce
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_PASSWORD=your_salesforce_password
SALESFORCE_SECURITY_TOKEN=your_salesforce_security_token
```

#### **Custom CRM Integration**
```bash
# Custom CRM Configuration
CRM_TYPE=custom
CUSTOM_CRM_URL=https://your-crm-api.com/webhook
CUSTOM_CRM_API_KEY=your_custom_crm_api_key
```

### 📱 Optional Integrations

#### **SMS Notifications (Twilio)**
```bash
ENABLE_SMS_NOTIFICATIONS=true
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### **Slack Integration**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
```

## 🗄️ Database Schema

### foreclosure_responses
- **Contact Information**: name, email, phone
- **Situation Assessment**: financial details, property info
- **Problem Identification**: challenges and difficulties
- **Impact Analysis**: family and financial impact
- **Solution Planning**: preferences and openness to options
- **Status Tracking**: submission status, notes, assignments
- **Metadata**: timestamps, urgency levels, CRM sync status

## 📊 Admin Features

### 📈 Enhanced Dashboard
- **Real-time statistics** with urgency breakdown
- **Advanced filtering** by multiple criteria
- **Visual priority indicators** for urgent cases
- **Comprehensive submission details** view
- **Status management** with automated notifications

### 🔔 Notification Management
- **Email notification settings** with granular controls
- **SMS notification configuration** for urgent cases
- **Slack integration settings** for team notifications
- **Follow-up schedule customization**
- **Recipient management** for different notification types

### 📋 Reporting & Analytics
- **CSV export** with comprehensive data
- **Filtering and search** capabilities
- **Performance metrics** and response times
- **Email delivery statistics** via MailerLite
- **CRM sync status** and error tracking

## 🚀 Deployment

### 📧 MailerLite Domain Setup
1. **Add your domain** to MailerLite
2. **Verify domain ownership** via DNS records
3. **Configure DKIM** for better deliverability
4. **Set up custom tracking domain** (optional)

### 🔗 CRM Configuration
1. **Set up API credentials** for your chosen CRM
2. **Configure custom fields** to match submission data
3. **Test integration** with sample submissions
4. **Set up automation rules** in your CRM

### 🌐 Production Deployment
```bash
# Build the application
npm run build

# Deploy to Netlify/Vercel
# Set environment variables in your hosting platform
# Deploy Supabase edge functions
supabase functions deploy send-notification-email
supabase functions deploy schedule-follow-ups
```

## 🎯 Workflow Overview

1. **Client Submission**
   - Client fills out foreclosure questionnaire
   - Data saved to Supabase with automatic urgency detection
   - Client added to MailerLite with appropriate tags

2. **Automated Notifications**
   - Instant email to admin team via MailerLite
   - Urgent cases trigger additional notifications (SMS, Slack)
   - Client receives welcome email sequence

3. **CRM Integration**
   - Contact created/updated in CRM with full submission data
   - Lead scoring based on urgency level
   - Activity logged for tracking

4. **Follow-up Management**
   - Automated reminders sent to admin team
   - Status updates trigger client notifications
   - Progress tracked in admin dashboard

5. **Ongoing Communication**
   - Status updates sent to clients automatically
   - Admin can add notes and update status
   - All interactions logged in CRM

## 🔧 Customization

### 📧 Email Templates
- Modify templates in `/supabase/functions/send-notification-email/index.ts`
- Customize branding, colors, and messaging
- Add your company logo and contact information

### 🎨 Admin Interface
- Customize notification settings in admin dashboard
- Configure follow-up schedules
- Set up custom recipient lists

### 🔗 CRM Field Mapping
- Modify CRM integration functions for custom field mapping
- Add additional data points as needed
- Configure automation rules in your CRM

## 🤝 Support

For technical support or questions:
- **Email**: help@repmotivatedseller.org
- **Phone**: (555) 123-4567
- **Documentation**: See inline code comments and configuration examples

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🎉 What's New in This Version

### ✨ Enhanced Email System
- **MailerLite integration** with professional email templates
- **Automated list management** and segmentation
- **Email tracking** and analytics
- **Welcome sequences** and drip campaigns

### 🔗 Advanced CRM Integration
- **Multi-CRM support** (HubSpot, Salesforce, Pipedrive, Custom)
- **Automatic contact creation** with comprehensive data mapping
- **Activity logging** for all interactions
- **Lead scoring** based on urgency levels

### 🔔 Multi-Channel Notifications
- **SMS notifications** via Twilio for urgent cases
- **Slack integration** for team notifications
- **Configurable notification settings** in admin dashboard
- **Automated follow-up reminders** with customizable schedules

### 📊 Enhanced Admin Dashboard
- **Urgency-based filtering** and priority indicators
- **Comprehensive notification settings** management
- **Real-time statistics** with detailed breakdowns
- **Improved user experience** with tabbed interface

This comprehensive system ensures no potential client falls through the cracks while maintaining professional communication and efficient workflow management.