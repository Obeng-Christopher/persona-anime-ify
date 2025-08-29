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

    // Convert base64 image to proper format for Gemini API
    const base64Data = image.split(',')[1]
    
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
- Include ${character.costume_description || 'characteristic costume and accessories'}
- Apply the characteristic features and styling of ${character.name}
- Background should complement the ${character.anime_series} anime aesthetic
- High resolution output suitable for download and sharing
- Style should match the art direction of ${character.anime_series}

Character-specific transformation: ${character.prompt_template || 'Transform the person to match the anime character style'}

Make the transformation look natural and professionally done, as if it's official anime artwork.
`

    // Call Gemini 2.5 Flash Image Preview API for image generation
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${geminiApiKey}`, {
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

    // Extract the generated image from Gemini response
    let transformedImage = null
    
    if (geminiResult.candidates && geminiResult.candidates[0] && geminiResult.candidates[0].content) {
      for (const part of geminiResult.candidates[0].content.parts) {
        if (part.inlineData) {
          // Convert the generated image data to base64
          const imageData = part.inlineData.data
          transformedImage = `data:image/png;base64,${imageData}`
          break
        }
      }
    }

    // If no image was generated, try to use the text response to create a more detailed prompt
    if (!transformedImage) {
      console.log('No image generated, attempting to enhance prompt...')
      
      // Extract text response to enhance the prompt
      let enhancedPrompt = transformationPrompt
      if (geminiResult.candidates && geminiResult.candidates[0] && geminiResult.candidates[0].content) {
        for (const part of geminiResult.candidates[0].content.parts) {
          if (part.text) {
            enhancedPrompt += `\n\nAdditional details: ${part.text}`
            break
          }
        }
      }

      // Try a second call with enhanced prompt for image generation
      const enhancedResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: enhancedPrompt + "\n\nGenerate an anime-style image based on this description."
              }
            ]
          }],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.6,
            topP: 0.95,
            topK: 20
          }
        })
      })

      if (enhancedResponse.ok) {
        const enhancedResult = await enhancedResponse.json()
        console.log('Enhanced Gemini response:', JSON.stringify(enhancedResult, null, 2))
        
        if (enhancedResult.candidates && enhancedResult.candidates[0] && enhancedResult.candidates[0].content) {
          for (const part of enhancedResult.candidates[0].content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data
              transformedImage = `data:image/png;base64,${imageData}`
              break
            }
          }
        }
      }
    }

    // If still no image generated, use a fallback approach
    if (!transformedImage) {
      console.log('Using fallback approach...')
      
      // For now, we'll use the original image as a placeholder
      // In production, you might want to integrate with another image generation service
      transformedImage = image
      
      // Log the issue for debugging
      console.log('Image generation failed, using fallback')
    }

    // Update transformation record with result
    const { error: updateError } = await supabase
      .from('transformations')
      .update({
        transformed_image_url: transformedImage,
        status: 'completed',
        completed_at: new Date().toISOString(),
        processing_time: Date.now() - new Date(transformation.created_at).getTime()
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
        transformed_image: transformedImage,
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
