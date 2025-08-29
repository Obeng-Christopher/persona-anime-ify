# Transform Image Edge Function

This Supabase Edge Function uses Google's Gemini AI to transform uploaded photos into anime-style illustrations based on selected characters.

## Features

- **AI-Powered Transformation**: Uses Google Gemini 2.5 Flash Image Preview model
- **Character-Based Styling**: Transforms photos to match specific anime character styles
- **High-Quality Output**: Generates high-resolution anime-style illustrations
- **Fallback Handling**: Includes robust error handling and fallback mechanisms
- **Database Integration**: Tracks transformations in Supabase database

## Setup

### 1. Environment Variables

Set the following environment variables in your Supabase project:

```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Google Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Enable the Gemini 2.5 Flash Image Preview model
4. Copy your API key to the `GEMINI_API_KEY` environment variable

### 3. Database Schema

Ensure you have the following tables in your Supabase database:

```sql
-- Characters table
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  anime_series TEXT NOT NULL,
  image_url TEXT NOT NULL,
  costume_description TEXT,
  prompt_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transformations table
CREATE TABLE transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  character_id UUID REFERENCES characters(id),
  original_image_url TEXT NOT NULL,
  transformed_image_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  processing_time INTEGER
);

-- Function to increment user transformations count
CREATE OR REPLACE FUNCTION increment_user_transformations(user_id TEXT)
RETURNS void AS $$
BEGIN
  -- Add your logic here to track user transformation counts
  -- This is a placeholder function
END;
$$ LANGUAGE plpgsql;
```

## Deployment

### Deploy to Supabase

```bash
# Navigate to your project directory
cd persona-anime-ify

# Deploy the function
supabase functions deploy transform-image
```

### Local Testing

```bash
# Start Supabase locally
supabase start

# Test the function
supabase functions serve transform-image --env-file .env.local
```

## API Usage

### Request Format

```typescript
POST /functions/v1/transform-image
Content-Type: application/json
Authorization: Bearer your_supabase_anon_key

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "character_id": "uuid-of-character",
  "user_id": "user-id"
}
```

### Response Format

```typescript
{
  "transformation_id": "uuid",
  "transformed_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "character_name": "Naruto Uzumaki",
  "status": "completed"
}
```

## How It Works

1. **Image Upload**: Receives base64-encoded image from the client
2. **Character Analysis**: Fetches character details from the database
3. **Prompt Generation**: Creates detailed transformation prompts
4. **AI Processing**: Sends image and prompt to Google Gemini API
5. **Image Generation**: Receives generated anime-style image
6. **Fallback Handling**: If image generation fails, uses enhanced prompts
7. **Database Update**: Stores transformation results and metadata
8. **Response**: Returns transformed image to the client

## Error Handling

The function includes comprehensive error handling:

- **Missing Parameters**: Validates required input fields
- **Character Not Found**: Handles invalid character IDs
- **API Failures**: Manages Gemini API errors gracefully
- **Image Generation Failures**: Implements fallback mechanisms
- **Database Errors**: Handles database operation failures

## Performance Considerations

- **Processing Time**: Typical transformations take 30-60 seconds
- **Image Size**: Supports images up to 10MB
- **Concurrent Requests**: Handles multiple simultaneous transformations
- **Caching**: Consider implementing Redis caching for repeated requests

## Security

- **Authentication**: Requires valid Supabase JWT tokens
- **Input Validation**: Sanitizes all input parameters
- **Rate Limiting**: Consider implementing rate limiting for production
- **API Key Protection**: Environment variables protect sensitive keys

## Troubleshooting

### Common Issues

1. **Gemini API Key Invalid**: Check your API key and permissions
2. **Image Generation Fails**: Verify the model is enabled in Google AI Studio
3. **Database Connection Errors**: Check Supabase connection settings
4. **CORS Issues**: Ensure proper CORS headers are set

### Debug Mode

Enable debug logging by checking the function logs:

```bash
supabase functions logs transform-image
```

## Future Enhancements

- **Multiple AI Models**: Support for DALL-E, Midjourney, etc.
- **Batch Processing**: Handle multiple images simultaneously
- **Style Presets**: Pre-defined transformation styles
- **Progress Tracking**: Real-time transformation progress updates
- **Image Quality Options**: Different resolution and quality settings

## Support

For issues and questions:
1. Check the Supabase logs
2. Verify environment variables
3. Test with the provided examples
4. Review Google Gemini API documentation
