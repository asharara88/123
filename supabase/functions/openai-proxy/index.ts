// Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
// https://supabase.com/docs/guides/functions/openai-api

import { createClient } from "npm:@supabase/supabase-js@2";

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-api-key, accept-profile, x-client-info, x-openai-key",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true", 
    "Vary": "Origin",
  };
}

// System prompt to enforce evidence-based recommendations
const SYSTEM_PROMPT = `You are Biowell AI, a personalized health coach focused on providing evidence-based health advice and supplement recommendations.

Your role is to:
- Provide personalized health advice based on user data and goals
- Make evidence-based supplement and lifestyle recommendations
- Help users understand their health metrics and trends
- Suggest actionable steps for health optimization

Guidelines:
- Always base recommendations on scientific research
- Consider the user's health data, goals, and conditions
- Be honest about limitations of current research
- Avoid making diagnostic or strong medical claims
- Defer to healthcare professionals for medical issues
- Focus on lifestyle, nutrition, exercise, and well-researched supplements
- Provide specific, actionable advice when possible
- Maintain a supportive and encouraging tone

Remember: You're a coach and guide, not a replacement for medical care.`;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  
  console.log("Request origin:", req.headers.get("origin"));

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Try to get OpenAI API key from different sources in priority order:
    // 1. Environment variable (set on Supabase)
    let OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API key. Please set the OPENAI_API_KEY secret in your Supabase project.");
      console.error("Use: supabase secrets set OPENAI_API_KEY=your-key");
      console.error("Available env vars:", Object.keys(Deno.env.toObject()).filter(key => !key.includes('PASSWORD')));
      
      return new Response(
        JSON.stringify({ 
          error: {
            message: "OpenAI API key not configured. Please set the OPENAI_API_KEY secret in your Supabase project.",
            type: "ConfigurationError",
            status: 500,
            setupInstructions: [
              "1. Login to Supabase CLI: supabase login",
              "2. Link your project: supabase link --project-ref YOUR_PROJECT_REF", 
              "3. Set the API key: supabase secrets set OPENAI_API_KEY=your-key",
              "4. Redeploy this function: supabase functions deploy openai-proxy"
            ]
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate API key format
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      console.error("Invalid OpenAI API key format. Key should start with 'sk-'");
      
      return new Response(
        JSON.stringify({ 
          error: {
            message: "Invalid OpenAI API key format. Key should start with 'sk-'",
            type: "ConfigurationError",
            status: 401
          }
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get request data
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ 
          error: {
            message: "Invalid JSON in request body",
            type: "ValidationError",
            status: 400
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { messages, context, options = {} } = requestData;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ 
          error: {
            message: "Invalid request: messages array is required",
            type: "ValidationError",
            status: 400
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client if we need user data
    let userData = null;
    if (context) {
      let parsedContext;
      try {
        parsedContext = typeof context === 'string' ? JSON.parse(context) : context;
      } catch {
        parsedContext = context;
      }
      
      if (parsedContext && parsedContext.userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", parsedContext.userId)
            .maybeSingle();

          if (!error) {
            userData = data;
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      }
      }
    }

    // Prepare messages for OpenAI API
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      // Add user context if available
      ...(userData
        ? [
            {
              role: "system",
              content: `User Context: ${JSON.stringify({
                name: userData.first_name
                  ? `${userData.first_name} ${userData.last_name || ""}`
                  : "Anonymous",
                email: userData.email,
                onboarding_completed: userData.onboarding_completed,
              })}`,
            },
          ]
        : []),
      // Add general context if provided
      ...(context ? [{ role: "system", content: `Context: ${JSON.stringify(context)}` }] : []),
      ...messages,
    ];

    console.log("Making request to OpenAI API...");

    // Call OpenAI API with timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      console.log("Calling OpenAI API with model:", options.model || "gpt-4");
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "Biowell-AI/1.0"
        },
        body: JSON.stringify({
          model: options.model || "gpt-4",
          messages: formattedMessages,
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          max_tokens: options.max_tokens || 1000,
          response_format: options.response_format,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("OpenAI API response not OK:", response.status, response.statusText);
        
        const errorText = await response.text();
        console.error("OpenAI API error response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        console.error("OpenAI API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // Provide more specific error messages
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ 
              error: {
                message: "Invalid OpenAI API key. Please check your API key configuration.",
                type: "AuthenticationError",
                status: 401
              }
            }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else if (response.status === 429) {
          return new Response(
            JSON.stringify({ 
              error: {
                message: "OpenAI API rate limit exceeded. Please try again later.",
                type: "RateLimitError",
                status: 429
              }
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else if (response.status === 402) {
          return new Response(
            JSON.stringify({ 
              error: {
                message: "OpenAI API quota exceeded. Please check your billing and usage limits.",
                type: "QuotaError",
                status: 402
              }
            }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              error: {
                message: errorData.error?.message || `OpenAI API call failed with status ${response.status}`,
                type: "APIError",
                status: response.status,
                details: errorData
              }
            }),
            {
              status: response.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // Return OpenAI response
      const data = await response.json();
      console.log("OpenAI API request successful");
      console.log("Response tokens used:", data.usage?.total_tokens || "unknown");
      
      // Save chat history if we have a valid user context
      if (context && typeof context === 'object' && context.userId && context.userId !== '00000000-0000-0000-0000-000000000000') {
        try {
          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          
          if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            await supabase
              .from('chat_history')
              .insert({
                user_id: context.userId,
                message: messages[messages.length - 1]?.content || '',
                response: data.choices?.[0]?.message?.content || '',
                role: 'assistant',
                session_id: context.sessionId || null
              });
          }
        } catch (historyError) {
          console.error('Error saving chat history:', historyError);
          // Don't fail the request if history saving fails
        }
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      console.error("Fetch error details:", fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            error: {
              message: "Request timeout: OpenAI API took too long to respond",
              type: "TimeoutError",
              status: 408
            }
          }),
          {
            status: 408,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Network or other fetch errors
      return new Response(
        JSON.stringify({ 
          error: {
            message: `Network error: ${fetchError.message}`,
            type: "NetworkError",
            status: 503,
            details: fetchError.toString()
          }
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          message: error.message || "An unexpected error occurred in the Edge Function",
          type: "InternalError",
          status: 500,
          details: error.toString()
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});