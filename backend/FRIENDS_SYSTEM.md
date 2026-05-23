# Friends System - Backend Implementation

## Overview

The Haritaly friends system allows users to:
- Send friend requests to other users by email
- Accept or reject incoming friend requests
- View their friend list
- Manage friendships

## Database Schema

### Friendship Model (Prisma)

```prisma
model Friendship {
  id           Int              @id @default(autoincrement())
  senderId     Int
  receiverId   Int
  status       FriendshipStatus @default(PENDING)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  sender       User             @relation("sender", fields: [senderId], references: [id], onDelete: Cascade)
  receiver     User             @relation("receiver", fields: [receiverId], references: [id], onDelete: Cascade)

  @@unique([senderId, receiverId])
  @@map("Friendship")
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

### User Model Relations

```prisma
model User {
  // ... other fields ...
  
  sentFriendRequests    Friendship[]    @relation("sender")
  receivedFriendRequests Friendship[]   @relation("receiver")
  places                Place[]
}
```

## API Endpoints

### 1. Get Friends List

**Endpoint:** `GET /api/friends`

**Authentication:** Required (Bearer token)

**Response:**
```json
[
  {
    "id": 2,
    "email": "friend@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "profilePicture": "https://...",
    "bio": "Love traveling"
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

---

### 2. Send Friend Request

**Endpoint:** `POST /api/friends`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "receiverId": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "senderId": 1,
    "receiverId": 5,
    "status": "PENDING",
    "createdAt": "2024-03-23T10:30:00Z",
    "updatedAt": "2024-03-23T10:30:00Z",
    "sender": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "receiver": {
      "id": 5,
      "email": "friend@example.com",
      "firstName": "Jane",
      "lastName": "Doe"
    }
  },
  "message": "Friend request sent"
}
```

**Status Codes:**
- 201: Request created
- 400: Validation error (self request, already friends, etc.)
- 404: User not found
- 401: Unauthorized
- 500: Server error

---

### 3. Get Pending Requests

**Endpoint:** `GET /api/friends/requests`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "senderId": 2,
      "receiverId": 1,
      "status": "PENDING",
      "createdAt": "2024-03-23T10:30:00Z",
      "sender": {
        "id": 2,
        "email": "friend@example.com",
        "firstName": "Jane",
        "lastName": "Doe",
        "profilePicture": "https://...",
        "bio": "Love traveling"
      }
    }
  ],
  "count": 1
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

---

### 4. Accept Friend Request

**Endpoint:** `POST /api/friends/:id/accept`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (number): Friendship request ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "senderId": 2,
    "receiverId": 1,
    "status": "ACCEPTED",
    "createdAt": "2024-03-23T10:30:00Z",
    "updatedAt": "2024-03-23T10:35:00Z",
    "sender": {
      "id": 2,
      "email": "friend@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "profilePicture": "https://..."
    },
    "receiver": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "https://..."
    }
  },
  "message": "Friend request accepted"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid status (not PENDING)
- 401: Unauthorized (not the receiver)
- 404: Request not found
- 500: Server error

---

### 5. Reject Friend Request

**Endpoint:** `POST /api/friends/:id/reject`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (number): Friendship request ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "senderId": 2,
    "receiverId": 1,
    "status": "REJECTED",
    "createdAt": "2024-03-23T10:30:00Z",
    "updatedAt": "2024-03-23T10:35:00Z"
  },
  "message": "Friend request rejected"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid status (not PENDING)
- 401: Unauthorized (not the receiver)
- 404: Request not found
- 500: Server error

---

### 6. Remove Friend

**Endpoint:** `DELETE /api/friends?friendId=:friendId`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `friendId` (number): ID of friend to remove

**Response:**
```json
{
  "message": "Friend removed"
}
```

**Status Codes:**
- 200: Success
- 400: Missing friend ID
- 401: Unauthorized
- 404: Friendship not found
- 500: Server error

---

## Implementation Details

### File Structure

```
backend/
├── prisma/
│   └── schema.prisma              # Database schema with Friendship model
│
├── src/
│   ├── lib/
│   │   ├── friends.ts             # Friend operations library
│   │   ├── db.ts                  # Database client
│   │   ├── jwt.ts                 # JWT verification
│   │   └── errors.ts              # Error handling
│   │
│   ├── middleware/
│   │   └── auth.ts                # Authentication middleware
│   │
│   └── app/api/friends/
│       ├── route.ts               # GET (list friends), POST (send request), DELETE (remove)
│       ├── requests/
│       │   └── route.ts           # GET (pending requests)
│       └── [id]/
│           ├── accept/
│           │   └── route.ts       # POST (accept request)
│           └── reject/
│               └── route.ts       # POST (reject request)
```

---

## Code Examples

### 1. Get Friends List

```typescript
// Frontend
const response = await fetch('/api/friends', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const friends = await response.json();
```

### 2. Send Friend Request

```typescript
// Frontend
const response = await fetch('/api/friends', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    receiverId: 5, // User ID of friend
  }),
});
const result = await response.json();
```

### 3. Accept Friend Request

```typescript
// Frontend
const response = await fetch(`/api/friends/${friendshipId}/accept`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const result = await response.json();
```

### 4. Get Pending Requests

```typescript
// Frontend
const response = await fetch('/api/friends/requests', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const requests = await response.json();
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Missing or invalid token | Include valid JWT in Authorization header |
| "User not found" | Receiver ID doesn't exist | Verify the user ID is correct |
| "Cannot send friend request to yourself" | senderId === receiverId | Don't send request to yourself |
| "Already friends" | Users already accepted friend request | Check friendship status first |
| "Friend request already sent" | Pending request already exists | Wait for response or cancel request |
| "You are not the receiver" | Wrong user accepting/rejecting | Only receiver can accept/reject |
| "Cannot accept request with status: X" | Request not in PENDING status | Check current status before accepting |

---

## Database Constraints

1. **Unique Constraint**: Only one Friendship record per sender-receiver pair
2. **Cascade Delete**: When a user is deleted, all their friendships are deleted
3. **Status Values**: PENDING, ACCEPTED, REJECTED (enforced by enum)
4. **Timestamps**: All friendships have createdAt and updatedAt timestamps

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only:
   - Accept/reject their own received requests
   - Remove friendships where they are a participant
   - View their own friends list
3. **Rate Limiting**: Should be added to prevent spam requests
4. **Data Validation**: All inputs are validated before processing

---

## Testing Scenarios

### Happy Path
1. User A sends friend request to User B (receiverId provided)
2. User B sees pending request in `/api/friends/requests`
3. User B accepts the request via `/api/friends/:id/accept`
4. Both users see each other in `/api/friends`

### Error Scenarios
1. Send request with invalid receiverId → 404
2. Send request with your own ID → 400
3. Accept request without valid token → 401
4. Accept request as non-receiver → 401
5. Remove friend with invalid friendId → 404

---

## Performance Notes

- Friend list queries use indexed fields (senderId, receiverId, status)
- Consider pagination for users with many friends (future optimization)
- Pending requests should be limited to recent requests
- Database indexes help with fast lookups

---

## Future Enhancements

1. Pagination for friend lists
2. Search friends by name/email
3. Block/unblock users
4. Friend request notifications
5. Last seen timestamp tracking
6. Friendship search/filtering

---

## Migration Commands

```bash
# Create migration for Friendship model
npx prisma migrate dev --name add_friendship_model

# Apply migrations to database
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

## API Testing with cURL

```bash
# Get friends
curl -X GET http://localhost:3000/api/friends \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send friend request
curl -X POST http://localhost:3000/api/friends \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": 5}'

# Get pending requests
curl -X GET http://localhost:3000/api/friends/requests \
  -H "Authorization: Bearer YOUR_TOKEN"

# Accept request
curl -X POST http://localhost:3000/api/friends/15/accept \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reject request
curl -X POST http://localhost:3000/api/friends/15/reject \
  -H "Authorization: Bearer YOUR_TOKEN"

# Remove friend
curl -X DELETE "http://localhost:3000/api/friends?friendId=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

This implementation provides a complete, secure friend management system for Haritaly.
