# Local Development Setup

## Overview
This project now supports separate environments for local development (MySQL) and production (PostgreSQL/Neon).

## Local Development (MySQL)

### Prerequisites
- MySQL server running locally
- Database `clickup_db` created
- Node.js dependencies installed

### Setup
1. Copy the local environment file:
   ```bash
   cd backend
   cp .env.local.example .env.local
   ```

2. Configure `.env.local` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=clickup_db
   ```

3. Initialize your local database:
   ```bash
   cd backend
   node database-init.sql  # Run this in MySQL
   ```

### Running Local Server
```bash
# Development mode (with auto-restart)
npm run dev-local

# Production-like mode
npm run start-local
```

The local server will run on `http://localhost:3001` and connect to your local MySQL database.

## Production (Vercel + PostgreSQL/Neon)

### Setup
The production environment uses the main `.env` file with `DATABASE_URL` pointing to Neon PostgreSQL.

### Deployment
```bash
# Initialize Neon database
npm run init-db

# Deploy to Vercel (automatic on push to main)
```

## Environment Variables

### Local (.env.local)
- `FORCE_MYSQL=true` - Forces MySQL usage even with DATABASE_URL present
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection details
- `PORT=3001` - Local server port

### Production (.env)
- `DATABASE_URL` - PostgreSQL connection string for Neon
- Other production-specific variables

## Architecture

- `app.js` - Production Express app (PostgreSQL)
- `appLocal.js` - Local Express app singleton (MySQL)
- `db.js` - Auto-detects database type based on environment
- `server.js` - Production server entry point
- `serverLocal.js` - Local server entry point