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

# Seed Users (Optional - for demo/testing)
# JSON array of users to create. Run: bun run seed:users
SEED_USERS=[{"username":"superadmin","password":"admin123","role":"super-admin"},{"username":"director1","password":"director123","role":"director","universityCode":"DEFAULT","firstName":"John","lastName":"Doe","email":"director@university.edu","phone":"0123456789"},{"username":"student1","password":"student123","role":"student","universityCode":"DEFAULT","email":"student@university.edu","idCard":"1234567890123","firstName":"Jane","lastName":"Smith"}]
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

## Seed Users (Demo/Testing)

You can pre-configure demo users in your `.env.local` file using the `SEED_USERS` variable. This is useful for development and testing.

### Configuration Format

`SEED_USERS` should be a JSON array of user objects. Each user object can have the following fields:

**Required fields for all users:**
- `username`: Unique username
- `password`: Password (will be hashed automatically)
- `role`: One of `"super-admin"`, `"admin"`, `"director"`, or `"student"`

**Optional fields:**
- `universityCode`: University code (required for non-super-admin users, defaults to "DEFAULT")

**Director-specific fields:**
- `firstName`: Director's first name
- `lastName`: Director's last name
- `email`: Director's email
- `phone`: Director's phone number

**Student-specific fields:**
- `email`: Student's email (required for student role)
- `idCard`: Student's ID card number (required for student role)
- `firstName`: Student's first name (required for student role)
- `lastName`: Student's last name (required for student role)
- `phone`: Student's phone number
- `program`: Student's program
- `department`: Student's department

### Example Configuration

```env
SEED_USERS=[
  {
    "username": "superadmin",
    "password": "admin123",
    "role": "super-admin"
  },
  {
    "username": "director1",
    "password": "director123",
    "role": "director",
    "universityCode": "DEFAULT",
    "firstName": "John",
    "lastName": "Doe",
    "email": "director@university.edu",
    "phone": "0123456789"
  },
  {
    "username": "student1",
    "password": "student123",
    "role": "student",
    "universityCode": "DEFAULT",
    "email": "student@university.edu",
    "idCard": "1234567890123",
    "firstName": "Jane",
    "lastName": "Smith"
  }
]
```

### Running the Seed Script

After configuring `SEED_USERS` in your `.env.local` file, run:

```bash
bun run seed:users
```

The script will:
- Create user accounts with hashed passwords
- Create associated director records for directors
- Create associated student records for students
- Skip users that already exist (idempotent - safe to run multiple times)
- Show a summary of created, skipped, and error counts

### Notes

- The script is **idempotent** - you can run it multiple times safely. Existing users will be skipped.
- Super-admin users don't need a `universityCode`
- Directors and students should specify a `universityCode` (or it will default to "DEFAULT")
- Make sure the university with the specified code exists before seeding users
- Student records require `email`, `idCard`, `firstName`, and `lastName` fields
