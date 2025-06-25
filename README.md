# RepMotivatedSeller - Foreclosure Assistance Platform

A comprehensive real estate platform with foreclosure assistance questionnaire, admin dashboard, and automated notifications.

## 🚀 Features

### 📋 Foreclosure Questionnaire
- **Multi-step SPIN methodology** questionnaire
- **Contact information collection** with privacy protection
- **Situation assessment** with financial details
- **Problem identification** and impact analysis
- **Solution planning** and need-payoff questions
- **Real-time form validation** and progress tracking

### 🎛️ Admin Dashboard
- **Real-time statistics** and submission overview
- **Advanced filtering** by status, date, and search terms
- **Priority-based organization** (high/medium/low urgency)
- **Status management** with notes and assignment tracking
- **CSV export** functionality for external analysis
- **Responsive design** for mobile and desktop

### 📧 Automated Email Notifications
- **New submission alerts** to admin team
- **Urgent case notifications** for high-priority situations
- **Status update emails** to clients
- **Professional HTML templates** with branding
- **Multiple recipient support** for urgent cases

### 🔗 CRM Integration
- **Automatic lead creation** in your CRM system
- **Contact synchronization** with submission data
- **Event logging** for all interactions
- **Urgency level tracking** and lead scoring
- **Custom field mapping** for your CRM needs

### 🔐 Security & Authentication
- **Supabase authentication** with email/password
- **Row Level Security (RLS)** for data protection
- **Admin role management** with proper permissions
- **Secure data handling** and encryption

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Email**: Resend API (configurable for other providers)
- **CRM**: HubSpot integration (configurable for others)
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
   Fill in your Supabase, email service, and CRM credentials.

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `/supabase/migrations/`
   - Deploy the edge functions in `/supabase/functions/`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### foreclosure_responses
- Contact information (name, email, phone)
- Situation assessment data
- Problem identification responses
- Impact analysis details
- Solution planning preferences
- Status tracking and notes
- Timestamps and metadata

## 📧 Email Configuration

### Supported Providers
- **Resend** (recommended)
- **SendGrid**
- **Mailgun**
- **Amazon SES**

### Email Types
1. **New Submission**: Sent to admin when form is submitted
2. **Urgent Case**: Sent for high-priority situations (NOD, 3+ missed payments)
3. **Status Update**: Sent to client when status changes

## 🔗 CRM Integration

### Supported CRMs
- **HubSpot** (built-in)
- **Salesforce** (configurable)
- **Pipedrive** (configurable)
- **Custom API** endpoints

### Data Synced
- Contact information
- Financial details
- Urgency level
- Submission status
- Notes and interactions

## 🎯 Priority System

### High Priority (Red)
- Notice of Default received
- 3+ missed payments
- Client feeling overwhelmed

### Medium Priority (Yellow)
- 1-2 missed payments
- Difficulty with lender

### Low Priority (Green)
- Anticipating trouble
- No missed payments yet

## 🚀 Deployment

### Environment Setup
1. Set up production Supabase project
2. Configure email service (Resend recommended)
3. Set up CRM integration
4. Update environment variables

### Deploy to Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Deploy to Vercel
```bash
vercel --prod
```

## 📊 Admin Features

### Dashboard Overview
- Total submissions count
- Status breakdown (submitted/reviewed/contacted/closed)
- Recent activity timeline
- Urgent cases highlighting

### Submission Management
- Detailed submission view
- Status updates with notifications
- Notes and assignment tracking
- Contact information management

### Reporting & Export
- CSV export with custom date ranges
- Filtering by status and urgency
- Search functionality
- Performance metrics

## 🔧 Configuration

### Admin Access
Set admin users by:
1. Email: `admin@repmotivatedseller.org`
2. User metadata: `role: 'admin'`
3. Name containing "admin"

### Email Templates
Customize email templates in:
- `/supabase/functions/send-notification-email/index.ts`

### CRM Mapping
Configure CRM field mapping in:
- `logToCRM()` function in email notification edge function

## 🤝 Support

For technical support or questions:
- Email: help@repmotivatedseller.org
- Phone: (555) 123-4567

## 📄 License

This project is proprietary software. All rights reserved.