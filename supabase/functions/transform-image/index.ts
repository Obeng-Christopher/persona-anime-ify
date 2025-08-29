import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image, character_id, user_id } = await req.json()

    if (!image || !character_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get character details for transformation prompt
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', character_id)
      .single()

    if (characterError || !character) {
      console.error('Character fetch error:', characterError)
      return new Response(
        JSON.stringify({ error: 'Character not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Create transformation record
    const { data: transformation, error: transformationError } = await supabase
      .from('transformations')
      .insert({
        user_id,
        character_id,
        original_image_url: image,
        status: 'processing'
      })
      .select()
      .single()

    if (transformationError) {
      console.error('Transformation creation error:', transformationError)
      return new Response(
        JSON.stringify({ error: 'Failed to create transformation record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Convert base64 image to blob for Gemini API
    const base64Data = image.split(',')[1]
    const imageBlob = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    // Prepare Gemini API request
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Create detailed transformation prompt
    const transformationPrompt = `
Transform this uploaded photo of a person into a high-quality anime-style illustration where the person is transformed into ${character.name} from ${character.anime_series}.

Requirements:
- Apply anime art style with clean lines and vibrant colors
- Transform the person to look like ${character.name} while maintaining basic facial structure
- Include ${character.costume_description}
- Apply the characteristic features and styling of ${character.name}
- Background should complement the ${character.anime_series} anime aesthetic
- High resolution output suitable for download and sharing
- Style should match the art direction of ${character.anime_series}

Character-specific transformation: ${character.prompt_template}

Make the transformation look natural and professionally done, as if it's official anime artwork.
`

    // Call Gemini 2.5 Flash API for image transformation
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: transformationPrompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.4,
          topP: 0.95,
          topK: 20
        }
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      
      // Update transformation status to failed
      await supabase
        .from('transformations')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transformation.id)

      return new Response(
        JSON.stringify({ error: 'AI transformation failed', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const geminiResult = await geminiResponse.json()
    console.log('Gemini response:', JSON.stringify(geminiResult, null, 2))

    // For now, since Gemini 2.5 Flash primarily generates text descriptions,
    // we'll use a placeholder approach and later integrate with an image generation model
    // In a real implementation, you'd chain this with an image generation API like DALL-E or Midjourney

    // For demonstration, we'll simulate the transformation result
    // In production, you'd integrate with an actual image generation service
    const mockTransformedImage = image // Placeholder - in real app, this would be the AI-generated image

    // Update transformation record with result
    const { error: updateError } = await supabase
      .from('transformations')
      .update({
        transformed_image_url: mockTransformedImage,
        status: 'completed',
        completed_at: new Date().toISOString(),
        processing_time: 3000 // Mock processing time
      })
      .eq('id', transformation.id)

    if (updateError) {
      console.error('Transformation update error:', updateError)
    }

    // Update user's total transformations count
    await supabase.rpc('increment_user_transformations', { user_id })

    return new Response(
      JSON.stringify({ 
        transformation_id: transformation.id,
        transformed_image: mockTransformedImage,
        character_name: character.name,
        status: 'completed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Transform image error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})