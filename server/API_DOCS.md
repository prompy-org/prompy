# Prompy API Documentation

## Base URL
`https://api.prompy.app` (Production)
`http://localhost:5000` (Development)

## Authentication
All endpoints require authentication (to be implemented). For now, a userId is passed in the request.

## Endpoints

### Get All Prompts
- **URL**: `/api/prompts`
- **Method**: `GET`
- **Query Parameters**: 
  - `userId` (optional): Filter prompts by user ID
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