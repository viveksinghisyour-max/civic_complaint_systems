# Civic Complaint System

A full-stack application for managing and resolving civic complaints, designed to help smart cities monitor and address issues efficiently.

## 🚀 Technology Stack

### Client (Frontend)
- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Language**: JavaScript

### Server (Backend)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [SQLite](https://www.sqlite.org/)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcryptjs (Password Hashing)

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## 📦 Installation

This project consists of a client and a server. You need to install dependencies for both.

### 1. Clone the repository
```bash
git clone <repository-url>
cd civic_complaint_systems
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

## 🏃‍♂️ Running the Application

You will need to run the server and client in separate terminals.

### Start the Server
From the `server` directory:
```bash
npm start
# OR for development with auto-restart
npm run dev
```
The server will start (default is typically port 3000 or 5000, check `server/index.js` or logs).

### Start the Client
From the `client` directory:
```bash
npm run dev
```
The client will start, usually accessible at `http://localhost:5173`.

## 📂 Project Structure

```
civic_complaint_systems/
├── client/         # React Frontend
├── server/         # Express Backend
└── README.md       # Project Documentation
```

## 🚀 Deployment

### Frontend (Client) - Deployed on Vercel
The React client is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to a GitHub repository.
2.  Log in to Vercel and click **"Add New..."** -> **"Project"**.
3.  Import your repository.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `client`.
    *   **Build Command**: `npm run build` (Default)
    *   **Output Directory**: `dist` (Default)
    *   **Install Command**: `npm install` (Default)
5.  Click **Deploy**.

### Backend (Server) - Important Note
⚠️ **The backend uses SQLite**, which is a file-based database. Vercel Serverless Functions are ephemeral, meaning **your database will be wiped on every redeployment or cold start** if hosted on Vercel.

**Recommended Production Hosting:**
For a persistent SQLite database without code changes, deploy the `server` directory to a VPS or a container service that supports persistent disks (e.g., **Render** with a generic service, **Railway**, or **DigitalOcean App Platform**).

**If you MUST use Vercel for Backend:**
You will need to migrate from SQLite to a cloud database like **Vercel Postgres**, **Supabase**, or **MongoDB Atlas**.
1. Update `server/db.js` to connect to the cloud DB.
2. Add environment variables in Vercel.
3. Deploy the `server` directory as a separate Vercel project (or rewrite rules in a monorepo).
