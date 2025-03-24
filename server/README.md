# Prompy Server

Backend server for the Prompy Chrome extension, providing API endpoints for prompt management.

## Features

- RESTful API for creating, reading, updating, and deleting prompts
- MongoDB integration for data persistence
- Test data mode for local development without a database

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/prompy
   USE_TEST_DATA=true  # Set to false when using a real database
   ```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed API documentation.

## Project Structure

- `index.js` - Entry point for the server
- `models/` - Database models
- `controllers/` - Request handlers
- `routes/` - API routes
- `middleware/` - Custom middleware functions (to be implemented)