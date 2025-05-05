# Database Admin Portal

A full-stack application with Next.js frontend and Express.js backend for database administration.

## Prerequisites

- Node.js (v18 or higher)
- SQL Server
- npm or yarn

## Project Structure

```
.
├── app/                 # Next.js frontend pages
├── components/          # React components
├── server/             # Express.js backend
│   ├── config/         # Database configuration
│   ├── routes/         # API routes
│   └── index.js        # Server entry point
├── lib/                # Utility functions
└── styles/             # CSS styles
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Setup

Create the following environment files:

#### Frontend (.env)
Create `.env` file in the root directory:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FRONTEND_PORT=3500
```

#### Backend (.env)
Create `.env` file in the server directory:
```
PORT=4000
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=your_database
```

### 4. Database Setup

1. Make sure SQL Server is running
2. Update the database credentials in `server/.env`
3. The server will automatically connect to the database on startup

### 5. Running the Application

#### Start the Backend Server
```bash
cd server
npm start
```

#### Start the Frontend Development Server
```bash
# In a new terminal
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3500
- Backend API: http://localhost:4000

## Development

- Frontend runs on port 3500
- Backend runs on port 4000
- API endpoints are available at `/api/tables/*`

## Troubleshooting

1. If the frontend can't connect to the backend:
   - Check if both servers are running
   - Verify the API URL in `.env` matches the backend port
   - Ensure CORS is properly configured

2. If database connection fails:
   - Verify SQL Server is running
   - Check database credentials in `server/.env`
   - Ensure the database exists and is accessible

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build the frontend application
- `npm run start` - Start the production frontend server
- `cd server && npm start` - Start the backend server 