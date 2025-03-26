# Prompy API Documentation

## Base URL
`https://api.prompy.app` (Production)
`http://localhost:5000` (Development)

## Authentication
All endpoints require authentication using JWT tokens. To authenticate:

1. Redirect users to `/api/auth/google` to initiate Google OAuth2 login
2. After successful authentication, users will be redirected to your frontend with a JWT token
3. Include this token in the Authorization header of all API requests:
   `Authorization: Bearer <token>`

### Authentication Endpoints

#### Google OAuth Login
- **URL**: `/api/auth/google`
- **Method**: `GET`
- **Description**: Redirects to Google login page

#### Google OAuth Callback
- **URL**: `/api/auth/google/callback`
- **Method**: `GET`
- **Description**: Callback URL for Google OAuth. Redirects to frontend with JWT token.

## Protected Endpoints

### Get All Prompts
- **URL**: `/api/prompts`
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Success Response**: 
  - **Code**: 200
  - **Content**: Array of prompt objects
  ```json
  [
    {
      "_id": "1",
      "title": "Code Review",
      "content": "Please review this code and suggest improvements...",
      "userId": "test-user-1",
      "tags": ["code", "review"],
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z"
    }
  ]
  ```
- **Error Response**:
  - **Code**: 500
  - **Content**: `{ "message": "Error fetching prompts", "error": "..." }`

### Get Prompt by ID
- **URL**: `/api/prompts/:id`
- **Method**: `GET`
- **URL Parameters**: 
  - `id`: Prompt ID
- **Success Response**: 
  - **Code**: 200
  - **Content**: Prompt object
- **Error Response**:
  - **Code**: 404
  - **Content**: `{ "message": "Prompt not found" }`
  - **Code**: 500
  - **Content**: `{ "message": "Error fetching prompt", "error": "..." }`

### Create Prompt
- **URL**: `/api/prompts`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "New Prompt",
    "content": "This is a new prompt...",
    "userId": "user-123",
    "tags": ["tag1", "tag2"]
  }
  ```
- **Success Response**: 
  - **Code**: 201
  - **Content**: Created prompt object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "message": "Error creating prompt", "error": "..." }`

### Update Prompt
- **URL**: `/api/prompts/:id`
- **Method**: `PUT`
- **URL Parameters**: 
  - `id`: Prompt ID
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content...",
    "tags": ["updated", "tags"]
  }
  ```
- **Success Response**: 
  - **Code**: 200
  - **Content**: Updated prompt object
- **Error Response**:
  - **Code**: 404
  - **Content**: `{ "message": "Prompt not found" }`
  - **Code**: 400
  - **Content**: `{ "message": "Error updating prompt", "error": "..." }`

### Delete Prompt
- **URL**: `/api/prompts/:id`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `id`: Prompt ID
- **Success Response**: 
  - **Code**: 200
  - **Content**: `{ "message": "Prompt deleted successfully" }`
- **Error Response**:
  - **Code**: 404
  - **Content**: `{ "message": "Prompt not found" }`
  - **Code**: 500
  - **Content**: `{ "message": "Error deleting prompt", "error": "..." }`
