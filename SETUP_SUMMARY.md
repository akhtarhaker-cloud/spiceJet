# SETUP & FIX SUMMARY

## ✅ Issues Fixed

### 1. **Form Not Saving to Supabase**

- **File**: `src/app/api/enquiries/route.ts`
- **Problem**: API only sent emails via Resend, didn't save to database
- **Fix**: Now saves enquiry data to Supabase `enquiries` table first, then optionally sends email
- **Result**: All form submissions are now persisted in database

### 2. **Missing RLS Policy for Public Inserts**

- **File**: `supabase/migrations/001_admin_cms.sql`
- **Problem**: No public insert policy on `enquiries` table - only admins could save
- **Fix**: Added `"public can insert enquiries"` policy to allow anonymous form submissions
- **Impact**: Form submissions now work without authentication

### 3. **Debug Log in Production Code**

- **File**: `src/lib/supabase/admin.ts`
- **Problem**: `console.log` exposing key length information
- **Fix**: Removed the debug log statement
- **Security**: Better security posture for production

### 4. **Environment Variables Not Documented**

- **File**: `.env.example`
- **Problem**: Missing Resend API key and email configuration
- **Fix**: Updated with complete variable list and descriptions

### 5. **No Project Documentation**

- **File**: `README.md` (created)
- **Problem**: No setup instructions or project overview
- **Fix**: Comprehensive README with:
  - Project structure overview
  - Step-by-step setup guide
  - Supabase configuration instructions
  - Database schema documentation
  - Troubleshooting guide
  - Deployment instructions

---

## 🔧 Next Steps: LOCAL SETUP

### Step 1: Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Sign up/login and create new project
3. Note the project URL and credentials

### Step 2: Get Supabase Credentials

In your Supabase dashboard → **Settings** → **API**:

- Copy **Project URL**
- Copy **anon public** key
- Copy **service_role** key (keep secret!)

### Step 3: Apply Database Migration

Run ONE of these:

**Option A - Using CLI (Recommended):**

```bash
npm install -g supabase
supabase login
supabase link --project-id your-project-id
supabase db push
```

**Option B - Manual:**

1. Go to Supabase dashboard → **SQL Editor**
2. Click **New Query**
3. Copy entire content of `supabase/migrations/001_admin_cms.sql`
4. Paste and click **Run**

### Step 4: Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional for email notifications
RESEND_API_KEY=your-key-here
ENQUIRY_TO_EMAIL=admin@samiraqglobal.com
```

### Step 5: Create Admin User

1. Supabase dashboard → **Authentication** → **Users**
2. Click **Invite**
3. Enter admin email
4. User gets invitation link
5. They set password and can log in

### Step 6: Run Locally

```bash
pnpm install  # if not already done
pnpm dev
```

Then:

- Public site: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

---

## 📊 How It Works Now

### Customer Submits Form

```
Customer fills inquiry form
↓
Form validates data (client-side)
↓
Sends POST to /api/enquiries
↓
API validates with Zod schema
↓
Saves to Supabase enquiries table (public insert allowed)
↓
[Optional] Sends email via Resend API
↓
Shows success message
↓
Admin sees in /admin/enquiries dashboard
```

### Database Tables Created

- `enquiries` - Customer inquiries (public can insert)
- `products` - Spice products (public can view active)
- `site_settings` - Website config (public can view)
- `site_list_items` - Dynamic lists
- `media_assets` - Images/files
- `admin_profiles` - Admin users
- `admin_audit_log` - Action tracking

---

## 🔐 Security Notes

✅ **RLS Enabled**: All tables have Row Level Security
✅ **Service Role**: Server-side only, never exposed to browser
✅ **Validation**: All inputs validated with Zod
✅ **Env Vars**: Sensitive keys marked with `SUPABASE_SERVICE_ROLE_KEY` (no NEXT*PUBLIC* prefix)

---

## 📝 File Changes Summary

| File                                    | Change              | Why                                    |
| --------------------------------------- | ------------------- | -------------------------------------- |
| `src/app/api/enquiries/route.ts`        | Complete rewrite    | Now saves to Supabase + optional email |
| `supabase/migrations/001_admin_cms.sql` | Added RLS policy    | Allow public form submissions          |
| `src/lib/supabase/admin.ts`             | Removed console.log | Remove debug output                    |
| `.env.example`                          | Updated             | Added Resend & email config            |
| `README.md`                             | Created             | Complete setup guide                   |

---

## ✨ You're All Set!

The form now:

1. ✅ Validates input data
2. ✅ Saves to Supabase database
3. ✅ Shows confirmation to user
4. ✅ Optionally sends email notification
5. ✅ Admin can view in dashboard

For detailed setup steps and troubleshooting, see **README.md** in the project root.
