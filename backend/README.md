# Zappy AI Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma Client:
```bash
npx prisma generate
```

3. Run migrations:
```bash
npx prisma migrate dev --name init
```

4. Start server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user

### Chat
- `POST /chat/message` - Send text or voice message
  - Body: `{ text: "message" }` OR `{ audio: "base64" }`
  - Response: `{ text: "response", audio: "base64" }`
- `GET /chat/bond` - Get current bond type
- `PUT /chat/bond` - Update bond type
  - Body: `{ bondType: "Girlfriend" }`
- `DELETE /chat/history` - Clear chat history

### Profile
- `GET /profile` - Get user profile

## Bond Types

Family: Mother, Father, Sister, Brother, Grandmother, Grandfather, Aunt, Uncle, Cousin
Chosen: Godparent, Mentor, Like a sister, Like a brother
Romantic: Girlfriend (default), Boyfriend, Partner, Significant Other, Wife, Husband, Fiancé, Fiancée
Friendship: Best Friend, Close Friend, Confidant, Companion, Neighbor, Teammate, Colleague, Coworker
