# 📘 Product Design Requirement (PDR)
### Project Name: **MesTalk**
### Project Type: Full-Stack Real-Time Chat Application
### Version: 1.0
### Author: Vinith Bylapudi
### Last Updated: 2025-06-27

---

## 🔹 1. **Purpose**
The purpose of **MesTalk** is to build a full-stack, real-time messaging platform supporting private and group chats, a friends system, and unique features such as random user matching (like Omegle). It will serve as a scalable, modular foundation for modern communication systems.

---

## 🔹 2. **Scope**
This project will support:
- User authentication and profile management
- Friends system (requests, blocking, online status)
- Real-time one-to-one and group messaging
- Temporary chat with random online users
- Optional audio/video calling using WebRTC
- Responsive and modern UI with animations

---

## 🔹 3. **Target Audience**
- General users looking for real-time messaging
- Developers as a reference implementation
- Employers as a showcase of full-stack proficiency

---

## 🔹 4. **System Overview**
MesTalk consists of three major systems:
- **Frontend**: Built in React + TailwindCSS + Socket.IO client
- **Backend**: Node.js + Express with Socket.IO server
- **Database**: MongoDB (Mongoose ODM)

---

## 🔹 5. **Features Breakdown**

### A. **Authentication**
- Signup / Login (JWT)
- Password hashing (bcrypt)
- `GET /api/auth/me` for session info
- Role-based access (if needed in future)

---

### B. **User Profile**
- Username, email, avatar, status
- Update profile details
- Show online/offline/last seen

---

### C. **Friends System**
- Send/Accept/Reject friend requests
- Block/Unblock users
- View all friends
- Search users

**API Endpoints:**
- `POST /api/friends/request/:userId`
- `POST /api/friends/accept/:userId`
- `GET /api/friends/list`
- `POST /api/friends/block/:userId`

---

### D. **Private & Group Messaging**
- Real-time messaging via Socket.IO
- Chat history (MongoDB)
- Seen, delivered, edited, deleted messages
- Media messages (optional phase)

**Socket Events:**
- `send-message`, `receive-message`
- `message-seen`, `message-deleted`, `message-edited`
- `typing-start`, `typing-stop`

---

### E. **Random Match Chat**
- “Connect to Random User” feature
- Anonymous pairing with online user (not a friend)
- Temporary chat room
- Option to “Next” or “Report”

**Socket Events:**
- `request-random-user`
- `matched-user`
- `random-chat-message`
- `disconnect-random`

**Backend Logic:**
- In-memory queue or Redis queue for matchmaking
- Exclude friends from matching pool

---

### F. **Audio/Video Calling (Optional Phase)**
- Peer-to-peer WebRTC connection
- Call start/accept/end
- Frontend call controls
- Signal exchange using Socket.IO

---

## 🔹 6. **Technical Stack**

| Layer     | Stack                        |
|-----------|------------------------------|
| Frontend  | React, TailwindCSS, Vite     |
| Realtime  | Socket.IO                    |
| Backend   | Node.js, Express             |
| Database  | MongoDB (Mongoose)           |
| Auth      | JWT, bcryptjs                |
| Video Call| WebRTC (Simple-Peer)         |
| Dev Tools | Postman, ESLint, Prettier    |
| Deployment| Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 🔹 7. **Database Models**

### ✅ User
```js
{
  _id,
  username,
  email,
  passwordHash,
  avatarUrl,
  status, // "online", "offline"
  lastSeen,
  friends: [userId],
  blocked: [userId]
}
```

### ✅ FriendRequest
```js
{
  _id,
  from: userId,
  to: userId,
  status: "pending" | "accepted" | "rejected",
  createdAt
}
```

### ✅ Message
```js
{
  _id,
  sender: userId,
  receiver: userId | roomId,
  content: String,
  timestamp: Date,
  seenBy: [userId],
  isEdited: Boolean,
  isDeleted: Boolean
}
```

### ✅ ChatRoom (for group & random)
```js
{
  _id,
  name,
  isGroup: Boolean,
  members: [userId],
  messages: [messageId],
  isTemporary: Boolean
}
```

---

## 🔹 8. **Socket.IO Architecture**

### Core Events
- `user-connected`
- `join-room`
- `send-message`
- `message-seen`
- `typing`
- `disconnect`
- `request-random-user`
- `matched-user`
- `start-call`, `signal`, `end-call` (for WebRTC)

---

## 🔹 9. **UI Components**

### Screens:
- Login / Signup
- Home (Friends List, Chat Section)
- Random Chat Modal
- Profile Settings
- Chat Interface
- Call Interface (optional)

### Components:
- Sidebar (Friends/Groups)
- Chat Window
- Message Bubble
- Input Field
- Avatar + Online Badge
- Typing Indicator
- Notification Popup

---

## 🔹 10. **Non-Functional Requirements**
- ✅ Responsive Design
- ✅ Secure API (JWT, input validation)
- ✅ Rate-limiting (for endpoints like random chat, friend requests)
- ✅ Error handling and logging
- ✅ Clean code structure and modular design

---

## 🔹 11. **Project Structure (Backend)**

```
/backend
├── controllers/
├── models/
├── routes/
├── middleware/
├── socket/
├── utils/
├── server.js
└── config/db.js
```

---

## 🔹 12. **Timeline**

| Phase | Feature | Duration |
|-------|---------|----------|
| 1     | Auth, User Model, JWT | 2 Days |
| 2     | Friends System | 2 Days |
| 3     | Chat System + Socket.IO | 3 Days |
| 4     | Random Matching System | 2 Days |
| 5     | UI & Styling (Tailwind) | 3 Days |
| 6     | Audio/Video (Optional) | 4 Days |
| 7     | Testing + Deployment | 2 Days |

---

## 🔹 13. **Future Enhancements**
- Push Notifications
- End-to-End Encryption
- Emoji & GIF support
- Chatbot Integration
- Message Reactions
- Cloudinary for media storage

---

## 📌 Next Steps
- ✅ Finalize this PDR
- ✅ Initialize GitHub repo and setup base structure
- ✅ Start backend with `UserModel`, `AuthController`, and JWT setup
