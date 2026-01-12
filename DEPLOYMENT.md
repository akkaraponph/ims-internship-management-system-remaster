# Cloudflare Pages Deployment Guide

This guide explains how to deploy the Internship Management System to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (sign up at https://dash.cloudflare.com)
2. A GitHub account with your repository
3. A Neon PostgreSQL database (or any PostgreSQL database)
4. All environment variables ready

## Initial Setup

### 1. Install Dependencies

First, install the required dependencies:

```bash
bun install
# or
npm install
```

This will install `@cloudflare/next-on-pages` and `wrangler` which are needed for Cloudflare Pages deployment.

### 2. Configure Environment Variables Locally

For local testing with Cloudflare Pages, create a `.dev.vars` file:

```bash
cp .dev.vars.example .dev.vars
```

Then edit `.dev.vars` with your actual values. This file is git-ignored and only used for local development.

**Note:** The `.dev.vars` file is only for local development. Production environment variables are set in the Cloudflare Pages dashboard.

## Cloudflare Pages Setup

### 1. Connect Your Repository

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Cloudflare to access your repositories
5. Select the `ims-internship-management-system-remaster` repository
6. Click **Begin setup**

### 2. Configure Build Settings

In the build configuration:

- **Project name**: `ims-internship-management-system` (or your preferred name)
- **Production branch**: `main` (or your default branch)
- **Build command**: `bun run pages:build` (or `npm run pages:build`)
- **Build output directory**: `.vercel/output/static`

**Note:** If using npm instead of bun, use `npm run pages:build` as the build command.

### 3. Set Environment Variables

Go to **Settings** → **Environment variables** and add the following variables:

#### Required Variables

```
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require
NEXTAUTH_URL=https://your-project.pages.dev
NEXTAUTH_SECRET=your-generated-secret-key
```

#### Optional Variables

```
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@example.com
SMTP_FROM_NAME=Internship Management System
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
```

**Important Notes:**

- `NEXTAUTH_URL` must be set to your Cloudflare Pages domain (e.g., `https://your-project.pages.dev`)
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Set these variables for both **Production** and **Preview** environments if you want preview deployments

### 4. Deploy

1. Click **Save and Deploy**
2. Cloudflare will start building your application
3. The first deployment may take a few minutes
4. Once complete, you'll get a URL like `https://your-project.pages.dev`

## Automatic Deployments

Once connected to Git, Cloudflare Pages will automatically:

- Deploy to **Production** when you push to the `main` branch
- Create **Preview** deployments for pull requests
- Rebuild on every push to connected branches

## Local Development with Cloudflare Pages

To test your application locally with Cloudflare Pages runtime:

1. Build the application:
   ```bash
   bun run pages:build
   ```

2. Run the local development server:
   ```bash
   bun run pages:dev
   ```

3. Open http://localhost:8788 in your browser

**Note:** Make sure you have a `.dev.vars` file with your environment variables for local testing.

## Manual Deployment

If you need to deploy manually using Wrangler CLI:

1. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```

2. Deploy:
   ```bash
   bun run pages:deploy
   ```

## Troubleshooting

### Build Fails

- Check that all dependencies are installed: `bun install`
- Verify the build command is correct: `bun run pages:build`
- Check build logs in Cloudflare Pages dashboard for specific errors

### Environment Variables Not Working

- Ensure variables are set in Cloudflare Pages dashboard (Settings → Environment variables)
- Verify variable names match exactly (case-sensitive)
- Check that variables are set for the correct environment (Production/Preview)
- Redeploy after adding new environment variables

### Database Connection Issues

- Verify `DATABASE_URL` is correctly set in Cloudflare Pages environment variables
- Ensure your database allows connections from Cloudflare's IP ranges
- Check that SSL mode is set correctly in the connection string (`?sslmode=require`)

### NextAuth Not Working

- Verify `NEXTAUTH_URL` matches your Cloudflare Pages domain exactly
- Ensure `NEXTAUTH_SECRET` is set and matches between environments
- Check that cookies are working (Cloudflare Pages supports cookies)

### API Routes Not Working

- Verify API routes are in the `app/api/` directory
- Check that routes use the correct HTTP methods (GET, POST, etc.)
- Review Cloudflare Pages function logs for errors

### Static Assets Not Loading

- Ensure static files are in the `public/` directory
- Verify build output includes static assets
- Check that asset paths are correct in your code

## Custom Domain

To use a custom domain:

1. Go to your project in Cloudflare Pages dashboard
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain name
5. Follow the DNS configuration instructions
6. Cloudflare will automatically provision SSL certificates

## Performance Optimization

Cloudflare Pages automatically provides:

- Global CDN distribution
- Edge caching
- Automatic HTTPS
- DDoS protection
- Analytics (if enabled)

## Database Migrations

Before deploying, ensure your database schema is up to date:

```bash
# Generate migrations
bun run db:generate

# Apply migrations (run this on your database)
bun run db:migrate
```

**Note:** Database migrations should be run manually on your database server, not during the Cloudflare Pages build process.

## Support

For issues specific to Cloudflare Pages:
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)

For issues with this application:
- Check the main README.md
- Review SETUP_ENV.md for environment configuration
