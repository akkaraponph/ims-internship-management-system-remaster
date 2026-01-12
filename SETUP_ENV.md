# Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
# Get your connection string from Neon (https://neon.tech)
# Format: postgresql://username:password@hostname/database?sslmode=require
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require

# NextAuth Configuration
# Generate a secret: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Environment
NODE_ENV=development
```

## Quick Setup

1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and update:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

## Getting Your Database URL from Neon

1. Go to https://neon.tech
2. Sign in to your account
3. Create a new project (or select an existing one)
4. Go to the project dashboard
5. Click on "Connection Details" or "Connection String"
6. Copy the connection string
7. Paste it as the value for `DATABASE_URL` in your `.env.local` file

## Generating NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET` value.
