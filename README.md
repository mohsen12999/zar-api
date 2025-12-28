# Zar API

A NestJS web API with JWT authentication, MySQL database, and email verification.

## Features

- ✅ User registration with email verification
- ✅ JWT-based authentication
- ✅ MySQL database with TypeORM
- ✅ Email sending after registration
- ✅ Email verification endpoint
- ✅ Protected routes with JWT guards

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- SMTP email account (Gmail, SendGrid, etc.)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (copy from `.env.example`):
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=zar_db
DB_SYNCHRONIZE=true
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com

# Application URL
APP_URL=http://localhost:3000
```

3. Create the MySQL database:
```sql
CREATE DATABASE zar_db;
```

4. Configure your SMTP settings:
   - For Gmail: Use an App Password (not your regular password)
   - Enable "Less secure app access" or use OAuth2

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### Verify Email
```http
GET /users/verify-email?token=verification-token
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Protected Endpoints

Use the `Authorization` header with Bearer token:
```http
Authorization: Bearer your-jwt-token
```

## Project Structure

```
src/
├── auth/              # Authentication module
│   ├── dto/          # Data transfer objects
│   ├── guards/       # JWT guards
│   ├── strategies/   # Passport strategies
│   └── ...
├── user/             # User module
│   ├── dto/          # DTOs
│   ├── entities/     # TypeORM entities
│   └── ...
├── email/            # Email service module
├── config/           # Configuration files
└── main.ts           # Application entry point
```

## Security Notes

- Change `JWT_SECRET` to a strong random string in production
- Use environment variables for all sensitive data
- Set `DB_SYNCHRONIZE=false` in production
- Use HTTPS in production
- Implement rate limiting for authentication endpoints

## License

MIT
