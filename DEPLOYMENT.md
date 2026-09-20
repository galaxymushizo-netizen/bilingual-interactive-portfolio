# Bilingual Interactive Portfolio Website

A Next.js portfolio with PostgreSQL database, Drizzle ORM, and admin panel.

## Features

- **Contact form** - Stores messages in database (`/api/contact`)
- **Admin panel** - View/manage messages at `/admin/messages`
- **WhatsApp integration** - Phone number: +255 699 279 126
- **Bilingual support** - English & Swahili
- **PostgreSQL + Drizzle ORM** - Type-safe database operations

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate database migrations
npx drizzle-kit generate --config=drizzle.config.json

# Run migrations (requires database)
npx drizzle-kit migrate --config=drizzle.config.json

# Start development server
npm run dev
```

## Database Schema

Key tables:
- `messages` - Contact form submissions (name, email, subject, message, read status)
- `profile` - User profile with WhatsApp field
- `users` / `sessions` - Admin authentication
- `projects`, `thoughts`, `timeline`, `skills`, `links`, `site_settings` - Content

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Create PostgreSQL Database

Options:
- **Vercel Postgres** (recommended): `vercel storage create postgres`
- **Neon**: https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app

### 3. Configure Vercel Project

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add Environment Variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `ADMIN_EMAIL` - Admin login email
   - `ADMIN_USERNAME` - Admin username
   - `ADMIN_PASSWORD` - Admin password (use a strong one!)

### 4. Run Migrations on Vercel

After first deployment, run migrations:
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx drizzle-kit migrate --config=drizzle.config.json
```

Or use Vercel's **PostgreSQL** integration which runs migrations automatically.

### 5. Access Admin Panel

Visit `https://your-app.vercel.app/admin/login` with your admin credentials.

## WhatsApp Link

The WhatsApp contact link uses: `https://wa.me/255699279126`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── contact/route.ts      # Contact form endpoint
│   │   └── admin/messages/       # Admin message management
│   └── admin/(protected)/        # Admin panel pages
├── components/admin/             # Admin UI components
├── db/
│   ├── index.ts                  # Database connection
│   └── schema.ts                 # Drizzle schema
├── lib/
│   ├── data.ts                   # Data fetching with seeding
│   ├── defaults.ts               # Default content (incl. WhatsApp)
│   └── auth.ts                   # Authentication
```

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint code
npm run typecheck    # TypeScript check
npx drizzle-kit studio # Database GUI
```