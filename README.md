# Task Manager API

A RESTful backend API for a Task Manager app built with Node.js, Express, PostgreSQL (Neon), and JWT authentication.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech))
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Deployment**: Render

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks | ✅ Yes |
| GET | `/api/tasks?status=pending` | Filter tasks by status | ✅ Yes |
| GET | `/api/tasks/:id` | Get one task | ✅ Yes |
| POST | `/api/tasks` | Create a task | ✅ Yes |
| PUT | `/api/tasks/:id` | Update a task | ✅ Yes |
| DELETE | `/api/tasks/:id` | Delete a task | ✅ Yes |

### Task Body (POST / PUT)
```json
{
  "title": "Finish assignment",
  "description": "Optional description",
  "status": "pending",
  "due_date": "2025-06-01"
}
```
> `status` must be one of: `pending`, `in-progress`, `completed`

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd task-manager-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Then edit `.env` with your values:
- `DATABASE_URL` → from your [Neon](https://neon.tech) project
- `JWT_SECRET` → any long random string
- `FRONTEND_URL` → your deployed frontend URL

### 4. Run locally
```bash
npm run dev
```

## Getting a Free PostgreSQL Database (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → copy the **Connection string**
3. Paste it as `DATABASE_URL` in your `.env`

## Deploying to Render

1. Push this project to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Set these:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables in the Render dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
6. Click **Deploy**

## Live URL

> Add your Render URL here after deploying

## Using the API from your React Frontend

```js
// In your Vite project, add to .env:
// VITE_API_URL=https://your-backend.onrender.com

const API = import.meta.env.VITE_API_URL;

// Login example
const response = await fetch(`${API}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
// Store data.token in localStorage

// Authenticated request example
const tasks = await fetch(`${API}/api/tasks`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});
```
