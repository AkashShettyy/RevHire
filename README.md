# RevHire

RevHire is a full-stack job portal with separate flows for job seekers and employers. Job seekers can search jobs, apply, track applications, and manage resumes. Employers can post jobs and review applicants.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT

## Project Structure

- `revhire-frontend` - React client
- `revhire-backend` - Express API

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd revHire
```

### 2. Backend Setup

```bash
cd revhire-backend
npm install
```

Create a `.env` file in `revhire-backend/` directory:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Replace:
- `your_mongodb_connection_string` with your MongoDB connection string
- `your_jwt_secret_key` with a secure random string

### 3. Frontend Setup

```bash
cd revhire-frontend
npm install
```

Create a `.env.local` file in `revhire-frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

If your backend runs on a different port or URL, update `VITE_API_URL` accordingly.

### 4. Run the Application

Start the backend:

```bash
cd revhire-backend
npm run dev
```

Start the frontend (in a new terminal):

```bash
cd revhire-frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Key Features

- User registration and login
- Role-based access for job seekers and employers
- Job posting and browsing
- Job application tracking
- Resume builder
- Notifications

## Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Important Notes

- Never commit `.env` or `.env.local` files to Git
- Keep your MongoDB credentials and JWT secret secure
- Update `VITE_API_URL` in `.env.local` if deploying to production
