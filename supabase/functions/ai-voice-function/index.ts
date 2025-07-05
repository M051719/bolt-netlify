import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import OpenAI from 'npm:openai@4.24.1'

// Define the request body type for better type safety
interface TextToSpeechRequest {
  text: string;
  voice?: string; // alloy, echo, fable, onyx, nova, or shimmer
  model?: string; // tts-1 or tts-1-hd
  responseFormat?: string; // mp3, opus, aac, or flac
}

Deno.serve(async (req) => {
  // CORS headers for browser requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    // Get the request body
    const requestData: TextToSpeechRequest = await req.json();
    
    // Validate required fields
    if (!requestData.text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get OpenAI API key from environment variables
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Set default values if not provided
    const voice = requestData.voice || 'alloy';
    const model = requestData.model || 'tts-1';
    const responseFormat = requestData.responseFormat || 'mp3';

    // Call OpenAI's Text-to-Speech API
    const audioResponse = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: requestData.text,
      response_format: responseFormat,
    });

    // Get the audio data as an ArrayBuffer
    const audioData = await audioResponse.arrayBuffer();

    // Optional: Log the request to Supabase if needed
    if (req.headers.get('Authorization')) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_ANON_KEY') || '',
          {
            global: {
              headers: { Authorization: req.headers.get('Authorization')! },
            },
          }
        );
        
        // You can log the request to a table if needed
        // await supabaseClient.from('voice_logs').insert({
        //   text: requestData.text,
        //   voice: voice,
        //   model: model,
        //   created_at: new Date().toISOString(),
        // });
      } catch (error) {
        // Continue even if logging fails
        console.error('Failed to log request:', error);
      }
    }

    // Return the audio data
    return new Response(audioData, {
      headers: {
        'Content-Type': `audio/${responseFormat}`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process text-to-speech request',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});