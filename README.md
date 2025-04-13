# Gemstone Valuation System

A comprehensive system for gemstone valuation, management, and ownership tracking. This project integrates a React frontend with a Node.js backend and PostgreSQL database.

## Project Structure

The project follows a monorepo structure:

```
gemstone-system/
├── packages/
│   ├── frontend/       # React frontend with Vite and Tailwind CSS
│   └── backend/        # Express backend API
└── database/           # Database scripts and migrations
```

## Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL (v14+)
- pgAdmin 4 (for database management)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/gemstone-system.git
cd gemstone-system
```

### 2. Install dependencies

```bash
npm run install:all
```

This will install dependencies for the root project, backend, and frontend.

### 3. Database Setup

1. Open pgAdmin 4 and connect to your PostgreSQL server
2. Create a new database called `gemstone_system`
3. Execute the following SQL script to create the initial table:

```sql
CREATE TABLE gemstone_families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    mineral_group VARCHAR(100),
    chemical_formula VARCHAR(100),
    hardness_min DECIMAL(3,1),
    hardness_max DECIMAL(3,1),
    rarity_level VARCHAR(20),
    value_category VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO gemstone_families (name, category, mineral_group, rarity_level, value_category) 
VALUES ('Diamond', 'Native Element', 'Carbon', 'Rare', 'Precious');

INSERT INTO gemstone_families (name, category, mineral_group, rarity_level, value_category) 
VALUES ('Ruby', 'Oxide', 'Corundum', 'Rare', 'Precious');

INSERT INTO gemstone_families (name, category, mineral_group, rarity_level, value_category) 
VALUES ('Emerald', 'Silicate', 'Beryl', 'Rare', 'Precious');
```

### 4. Environment Configuration

1. Update the backend environment variables:

Edit `packages/backend/.env.development`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres  # Replace with your PostgreSQL username
DB_PASSWORD=yourpassword  # Replace with your PostgreSQL password
DB_NAME=gemstone_system
```

2. The frontend environment is already configured to connect to `http://localhost:3001/api`

### 5. Running the Application

Start both the frontend and backend in development mode:

```bash
npm run dev
```

Or start them separately:

```bash
# Start just the backend
npm run start:backend

# Start just the frontend
npm run start:frontend
```

### 6. Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)
- API Health Check: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## API Endpoints

The following endpoints are available in this initial setup:

### Reference Data
- `GET /api/reference/gemstone-families` - Get all gemstone families
- `GET /api/reference/gemstone-families/:id` - Get a specific gemstone family
- `POST /api/reference/gemstone-families` - Create a new gemstone family
- `PUT /api/reference/gemstone-families/:id` - Update a gemstone family
- `DELETE /api/reference/gemstone-families/:id` - Delete a gemstone family

## Building for Production

To build both frontend and backend for production:

```bash
npm run build
```

## Roadmap

Future enhancements planned for this system:
- Authentication and user management
- Full gemstone valuation wizard
- Ownership transfer functionality
- Multi-vendor marketplace
- Mobile-friendly responsive design

## Troubleshooting

If you encounter issues with the connection between frontend and backend:

1. Ensure PostgreSQL is running and accessible
2. Check that the database connection details in `.env.development` are correct
3. Verify that both frontend and backend servers are running (check the terminal output)
4. Check browser console for any CORS-related errors