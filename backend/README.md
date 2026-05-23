# Haritaly Backend

Social map REST API built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env.local
```

Update `.env.local` with your PostgreSQL connection string and JWT secret.

3. **Setup database:**
```bash
npm run db:migrate
npm run db:generate
```

4. **Run development server:**
```bash
npm run dev
```

Server will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get user by ID

### Friends
- `GET /api/friends` - Get friend list
- `POST /api/friends` - Send friend request
- `DELETE /api/friends?friendId=X` - Remove friend
- `POST /api/friends/:id/accept` - Accept friend request
- `POST /api/friends/:id/reject` - Reject friend request

### Places
- `POST /api/places` - Create place
- `GET /api/places` - Get user's places
- `GET /api/places/:id` - Get place details
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place
- `GET /api/places/nearby?lat=X&lng=Y&radius=1000` - Get nearby friend places
- `GET /api/places/search?q=coffee` - Search places

### Health
- `GET /api/health` - Health check

## Development

Database studio:
```bash
npm run db:studio
```

## Tech Stack
- Next.js 15
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
