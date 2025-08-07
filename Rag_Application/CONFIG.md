# Configuration Guide

## How to Update Authorization Token

### Method 1: Environment Variable (Recommended)
1. Create a `.env` file in the project root (copy from `.env.example`)
2. Update the `VITE_AUTH_TOKEN` value:
   ```env
   VITE_AUTH_TOKEN=your_new_token_here
   ```
3. Restart the development server

### Method 2: Direct Code Update
- **File**: `src/services/ragService.ts`
- **Line**: Look for `const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN || 'your_token_here'`
- **Update**: Change the fallback token value

## How to Update API Base URL

### Environment Variable
1. In your `.env` file, update:
   ```env
   VITE_API_BASE_URL=http://your-new-api-url/api/v1
   ```

### Direct Code Update
- **File**: `src/services/ragService.ts`
- **Line**: Look for `const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'`

## Database Functions Available

The following functions are available to fetch data from your PostgreSQL database:

1. **General Database Data**: `RAGService.fetchDatabaseData('/your-endpoint')`
2. **Documents**: `RAGService.fetchDocumentsFromDB()`
3. **QA History**: `RAGService.fetchQAHistoryFromDB()`
4. **User Data**: `RAGService.fetchUserDataFromDB(userId?)`

## Backend API Endpoints Expected

Your backend should provide these endpoints for database access:

- `GET /api/v1/database/data` - General data endpoint
- `GET /api/v1/database/documents` - Document records
- `GET /api/v1/database/qa-history` - Question/Answer history
- `GET /api/v1/database/users` - User data
- `GET /api/v1/database/users/{userId}` - Specific user data

## Notes

- All requests include the Authorization header: `Bearer {your_token}`
- Environment variables in React must be prefixed with `VITE_`
- Restart the dev server after changing `.env` files
- The backend database configuration is not managed by the frontend