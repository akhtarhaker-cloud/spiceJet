# Samiraq Global - CMS & E-Commerce Platform

A premium Indian spice business website with integrated CMS admin panel and customer inquiry system. Built with **Next.js 15**, **TypeScript**, **Supabase**, and **Tailwind CSS**.

## 🎯 Features

- **Public Website**: Product showcase, company information, and inquiry forms
- **Admin Dashboard**: Manage products, settings, media, and customer inquiries
- **Database-Driven**: All content stored in Supabase PostgreSQL
- **Authentication**: Secure admin login via Supabase Auth
- **Email Notifications**: Inquiry notifications via Resend (optional)
- **Responsive Design**: Mobile-first approach with modern styling
- **SEO Optimized**: Dynamic sitemap and robots.txt

## 📋 Project Structure

```
samiraq-global/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── enquiries/     # Inquiry submission endpoint
│   │   │   └── admin/media/   # Media management API
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── content/       # Manage site content
│   │   │   ├── enquiries/     # View customer inquiries
│   │   │   ├── products/      # Manage products
│   │   │   ├── media/         # Manage media assets
│   │   │   ├── settings/      # Site settings
│   │   │   └── login/         # Admin authentication
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── InquiryForm.tsx   # Public inquiry form
│   │   ├── Header.tsx         # Navigation header
│   │   └── admin/             # Admin-specific components
│   └── lib/                   # Utility functions
│       ├── supabase/          # Supabase clients
│       │   ├── server.ts      # Server-side client
│       │   ├── browser.ts     # Browser client
│       │   ├── admin.ts       # Admin client (service role)
│       │   └── config.ts      # Configuration
│       ├── auth.ts            # Authentication helpers
│       ├── validations.ts     # Zod schemas
│       └── site.ts            # Site configuration
├── supabase/
│   └── migrations/            # Database migrations
│       └── 001_admin_cms.sql  # Main schema
├── public/
│   └── images/                # Static images
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── pnpm-workspace.yaml        # pnpm workspaces config
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Supabase** account (free tier works fine)
- **Resend** account (optional, for email notifications)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd samiraq-global

# Install dependencies
pnpm install
```

### Step 2: Set Up Supabase Project

#### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project:
   - Choose a project name (e.g., "samiraq-global")
   - Set a strong database password
   - Select your preferred region
   - Wait for the project to initialize

#### 2.2 Get Your Credentials

1. Go to **Settings** → **API** in your Supabase project
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

#### 2.3 Apply Database Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-id <your-project-id>

# Apply migrations
supabase db push
```

**Option B: Manual SQL Execution**

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content of `supabase/migrations/001_admin_cms.sql`
4. Paste it into the SQL editor
5. Click **Run**

#### 2.4 Create an Admin User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Invite**
3. Enter an admin email address
4. The user will receive an invitation link
5. Once they set their password, they're ready to log in

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your values in `.env.local`:

```env
# Required - From Supabase API settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional - For email notifications
RESEND_API_KEY=re_your_resend_key
ENQUIRY_TO_EMAIL=admin@samiraqglobal.com

# Your local development URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ **Security Note**: Never commit `.env.local` to git. The `.gitignore` file should already exclude it.

### Step 4: Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Access Admin Dashboard

1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Log in with the admin credentials you created in Step 2.4
3. Explore the admin dashboard to manage products, settings, and inquiries

## 📊 How the System Works

### Customer Inquiry Flow

```
1. Customer fills the inquiry form on the public website
   ↓
2. Form submits to POST /api/enquiries
   ↓
3. API validates data using Zod schema
   ↓
4. Data is saved to Supabase enquiries table (public insert allowed)
   ↓
5. Optional: Email notification sent via Resend API
   ↓
6. Success message shown to customer
   ↓
7. Admin views inquiry in /admin/enquiries dashboard
   ↓
8. Admin can mark inquiries as read/unread
```

### Database Schema

#### `enquiries` Table

- Stores all customer inquiries from both contact and export forms
- **Columns**: id, enquiry_type, name, email, phone, country, product_name, required_quantity, packaging_requirement, message, status, created_at
- **RLS Policy**: Public can insert, only admins can view/update/delete

#### `products` Table

- Catalog of spice products
- **Columns**: id, slug, name, local_name, description, image_url, rate, unit, is_active, position, created_at, updated_at
- **RLS Policy**: Public can view active products, admins can manage all

#### `site_settings` Table

- Website configuration (brand name, tagline, contact info, etc.)
- Only one row (enforced via boolean primary key)
- **RLS Policy**: Public can view, admins can edit

#### `admin_profiles` Table

- Admin user roles and permissions
- **RLS Policy**: Admins can view their own profile

#### `media_assets` Table

- Metadata for uploaded images/files
- **RLS Policy**: Admins can manage

#### `site_list_items` Table

- Dynamic lists like "Why Choose Us" and "Quality Claims"
- **RLS Policy**: Public can view, admins can manage

#### `admin_audit_log` Table

- Tracks all admin actions for compliance
- **RLS Policy**: Admins can view

## 🔐 Security

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Admin Authentication**: Protected via Supabase Auth
- **Service Role Key**: Used only server-side for admin operations
- **Validation**: All inputs validated with Zod before processing
- **Environment Variables**: Sensitive keys never exposed to browser (no `NEXT_PUBLIC_` prefix)

## 📝 Environment Variables Reference

| Variable                               | Required | Purpose                                            |
| -------------------------------------- | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | ✅       | Your Supabase project URL                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅       | Supabase anonymous key (safe for browser)          |
| `SUPABASE_SERVICE_ROLE_KEY`            | ✅       | Supabase service role (server-only)                |
| `NEXT_PUBLIC_SITE_URL`                 | ✅       | Your website URL (for authentication callbacks)    |
| `RESEND_API_KEY`                       | ❌       | Resend API key (optional, for email notifications) |
| `ENQUIRY_TO_EMAIL`                     | ❌       | Admin email for inquiry notifications              |

## 🛠 Development

### Available Scripts

```bash
# Development server (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint

# Run TypeScript check
pnpm tsc
```

### Tech Stack

- **Framework**: Next.js 15.5.2
- **Language**: TypeScript 5.9.2
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Validation**: Zod 3.24.1
- **Styling**: Tailwind CSS (from globals.css)
- **Email**: Resend API (optional)
- **Hosting**: Netlify (configured in `netlify.toml`)

## 🐛 Troubleshooting

### "Supabase environment variables are not configured"

**Solution**: Ensure your `.env.local` file has:

```
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-key>
```

### "Unauthorized" when accessing admin pages

**Possible causes:**

- Not logged in with an admin account
- User doesn't have admin role in `admin_profiles` table
- Session expired

**Solution**:

1. Check that user exists in Supabase Auth
2. Verify `admin_profiles` table has a row with that user's ID and role='admin'

### Inquiries not saving

**Possible causes:**

- Supabase not configured
- Service role key missing (for email notifications)
- RLS policies not applied

**Solution**:

1. Check browser console for API errors
2. Verify RLS policies in Supabase: Authentication → Policies → enquiries table
3. Make sure migration was applied successfully

### Email notifications not sending

**Solution**:

- Email notifications are optional - the form still works without Resend
- To enable: Get API key from [resend.com](https://resend.com), add to `.env.local`
- Set `ENQUIRY_TO_EMAIL` to the admin email

## 📈 Scaling & Deployment

### Before Production

1. **Update Site Settings**: Go to admin → Settings and update all company info
2. **Add Products**: Go to admin → Products and add your spice products
3. **Upload Logo**: Go to admin → Media to upload company logo
4. **Update Content**: Go to admin → Content to update "Why Choose Us" and quality claims
5. **Enable HTTPS**: Ensure your domain uses HTTPS
6. **Set Netlify URL**: Update `NEXT_PUBLIC_SITE_URL` in production environment

### Deployment to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy

### Database Backups

Supabase provides automatic daily backups. To restore:

1. Go to Supabase dashboard → Settings → Backups
2. Select a backup date and restore

## 📞 Support & Contact

For issues or questions:

- **Email**: samiraqglobal@gmail.com
- **WhatsApp**: +91 98276 42435
- **Location**: Sagar, Madhya Pradesh, India

## 📄 License

This project is proprietary to Samiraq Global. All rights reserved.

## 🔄 Version History

**v0.1.0** (Current)

- Initial project setup
- Database schema with CMS tables
- Admin dashboard for content management
- Public inquiry form system
- Email notifications integration
