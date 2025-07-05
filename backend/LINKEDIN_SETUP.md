# LinkedIn Integration Setup

This document explains how to set up LinkedIn integration for the AI Automation Tool.

## Overview

The application supports both real LinkedIn API integration and a mock service for development/testing purposes.

## Environment Variables

Add these variables to your `.env` file:

```env
# LinkedIn API Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3001/api/linkedin/callback

# Development/Testing
USE_MOCK_LINKEDIN=false  # Set to 'true' to use mock service
```

## Setup Options

### Option 1: Use Mock LinkedIn Service (Recommended for Development)

For development and testing, you can use the mock LinkedIn service which simulates the LinkedIn API without requiring real credentials.

1. Set `USE_MOCK_LINKEDIN=true` in your `.env` file
2. The application will use mock authentication and posting
3. No real LinkedIn app setup required

### Option 2: Real LinkedIn API Integration

To use the real LinkedIn API, you'll need to:

1. Create a LinkedIn Developer App at https://www.linkedin.com/developers/
2. Configure the app with the required scopes:
   - `w_member_social` - For posting content
   - `r_liteprofile` - For reading basic profile information
   - `r_emailaddress` - For reading email address
3. Set the redirect URI to `http://localhost:3001/api/linkedin/callback`
4. Copy the Client ID and Client Secret to your `.env` file
5. Set `USE_MOCK_LINKEDIN=false`

## LinkedIn App Configuration

### Required Scopes

The application requests these LinkedIn API scopes:

- **w_member_social**: Allows posting content to LinkedIn
- **r_liteprofile**: Allows reading basic profile information (name, profile picture)
- **r_emailaddress**: Allows reading the user's email address

### Redirect URI

Set the redirect URI in your LinkedIn app to:
```
http://localhost:3001/api/linkedin/callback
```

## Troubleshooting

### Common Issues

1. **"LinkedIn not authenticated"**
   - Make sure you've completed the OAuth flow
   - Check that your LinkedIn app is properly configured
   - Verify environment variables are set correctly

2. **"Could not retrieve user profile URN"**
   - This usually means the required scopes aren't granted
   - Ensure your LinkedIn app has `r_liteprofile` scope
   - Try using the mock service for development

3. **"Failed to publish post to LinkedIn"**
   - Check that your LinkedIn app has `w_member_social` scope
   - Verify the access token is valid and not expired
   - Check LinkedIn API rate limits

### Development Mode

For development, we recommend using the mock service:

```env
NODE_ENV=development
USE_MOCK_LINKEDIN=true
```

This will:
- Skip real LinkedIn authentication
- Simulate successful posting
- Provide mock profile data
- Avoid API rate limits and credential issues

### Testing the Integration

1. Start the backend server
2. Navigate to the Settings page in the frontend
3. Click "Connect LinkedIn"
4. If using mock service, you'll be redirected back immediately
5. If using real service, complete the LinkedIn OAuth flow
6. Try creating and publishing a post

## API Endpoints

- `GET /api/linkedin/auth-url` - Get LinkedIn authentication URL
- `GET /api/linkedin/callback` - Handle OAuth callback
- `GET /api/linkedin/status` - Get authentication status
- `GET /api/linkedin/profile` - Get user profile
- `POST /api/linkedin/disconnect` - Disconnect LinkedIn account

## Security Notes

- Never commit your LinkedIn credentials to version control
- Use environment variables for all sensitive configuration
- The mock service is safe for development but should not be used in production
- Real LinkedIn integration requires proper app review and approval from LinkedIn 