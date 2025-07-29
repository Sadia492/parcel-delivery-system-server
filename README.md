# 📦 Parcel Management API

A secure, modular, and role-based REST API for managing parcel deliveries. Built using **Express.js** and **Mongoose**, this backend system supports user roles (`admin`, `sender`, `receiver`) and allows operations like creating parcels, tracking delivery statuses, confirming deliveries, and managing users.

---

## 🚀 Features

- JWT-based secure authentication
- Role-based access control (`ADMIN`, `SENDER`, `RECEIVER`)
- Modular code architecture with route-level middleware
- Parcel status tracking with embedded status history
- Support for blocking/unblocking parcels and users
- Zod-based schema validation for robust input handling

---

## 🛠️ Installation

```bash
git clone https://github.com/Sadia492/parcel-delivery-system-server.git
cd parcel-delivery-system-server
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file at the root with the following variables:

```env
PORT=5000

# MongoDB Connection
DB_URL=mongodb+srv://demo-user:demo-password@cluster0.example.mongodb.net/parcelManagementDB?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Token Expiry Times
JWT_ACCESS_EXPIRES=2h
JWT_REFRESH_EXPIRES=365d

# Bcrypt Salt
PASSWORD_SALT_ROUND=10

# Frontend Client
FRONTEND_URL=https://your-frontend-url.vercel.app

```

---

## 📦 API Endpoints

### 1. Authentication

| Method | Endpoint                    | Description     | Access              |
| ------ | --------------------------- | --------------- | ------------------- |
| POST   | `/api/auth/change-password` | Change password | Authenticated users |
| POST   | `/api/auth/reset-password`  | Reset password  | Public              |
| POST   | `/api/auth/logout`          | Logout          | Authenticated users |

---

### 2. User Management

| Method | Endpoint                   | Description       | Access        |
| ------ | -------------------------- | ----------------- | ------------- |
| POST   | `/api/users/`              | Register new user | Public        |
| POST   | `/api/users/login`         | Login user        | Public        |
| POST   | `/api/users/refresh-token` | Refresh JWT token | Public        |
| GET    | `/api/users/`              | Get all users     | Admin, Sender |
| GET    | `/api/users/:id`           | Get user details  | Authenticated |
| PATCH  | `/api/users/block/:id`     | Block a user      | Admin only    |
| PATCH  | `/api/users/unblock/:id`   | Unblock a user    | Admin only    |

---

### 3. Parcel Operations

| Method | Endpoint                                  | Description                    | Access          |
| ------ | ----------------------------------------- | ------------------------------ | --------------- |
| POST   | `/api/parcels/`                           | Create new parcel              | Sender only     |
| GET    | `/api/parcels/`                           | Get all parcels                | Admin only      |
| GET    | `/api/parcels/me`                         | Get sender or receiver parcels | Sender/Receiver |
| GET    | `/api/parcels/incoming`                   | View incoming parcels          | Receiver        |
| GET    | `/api/parcels/history`                    | View delivery history          | Receiver        |
| PATCH  | `/api/parcels/status/:parcelId`           | Update parcel status           | Admin only      |
| PATCH  | `/api/parcels/cancel/:parcelId`           | Cancel parcel                  | Sender only     |
| PATCH  | `/api/parcels/confirm-delivery/:parcelId` | Confirm delivery               | Receiver only   |
| PATCH  | `/api/parcels/block/:parcelId`            | Block/unblock parcel           | Admin only      |

---

## 🧩 Parcel Schema Design

Each parcel contains:

- `trackingId`: Unique ID (`TRK-YYYYMMDD-xxxxxx`)
- `type`, `weight`, `fee`, `expectedDeliveryDate`
- `senderId`, `receiverId`
- `status`: `Requested`, `Approved`, `Dispatched`, `In Transit`, `Delivered`, `Canceled`, etc.
- `statusLog`: Array of objects:

  ```ts
  {
    status: string,
    location: string,
    updatedBy: string,
    timestamp: Date,
    note?: string
  }
  ```

- `isBlocked`: boolean
- `createdAt`, `updatedAt`: Timestamps

---

## 🔐 Role-Based Access Control

| Role     | Capabilities                                               |
| -------- | ---------------------------------------------------------- |
| Sender   | Create/cancel/view parcels                                 |
| Receiver | View/confirm parcels, check history                        |
| Admin    | Manage users, update status, block users/parcels, view all |

Middleware (`auth`, `checkUserBlocked`, `validateRequest`) handles role checks, access protection, and validation.

---

## 📁 Project Structure

```
src/
├── app.ts
├── config/
├── middlewares/
│   ├── auth.ts
│   ├── validateRequest.ts
│   └── checkUserBlocked.ts
├── modules/
│   ├── auth/
│   ├── user/
│   ├── parcel/
├── utils/
```

---

## 🧪 Testing & Documentation

- All endpoints tested using **Postman**
- Request validation handled via **Zod**
- Project tested locally with **MongoDB**
- Error handling with consistent response format
- Submit a 5–10 min **screen-recorded demo video**

---
