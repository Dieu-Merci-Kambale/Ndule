import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 401 
      });
    }

    const { action, payload, taskId } = await req.json();
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    const SUNO_API_URL = 'https://api.piapi.ai/api/v1/task';

    if (!SUNO_API_KEY) {
      throw new Error("Clé API Suno manquante côté serveur");
    }

    // ACTION: CREATE
    if (action === 'create') {
      // 1. Déduire la note (Sécurisé côté serveur)
      const { data: noteDeducted, error: rpcError } = await supabaseClient.rpc('deduct_note', { amount: 1 });
      
      if (rpcError || !noteDeducted) {
        return new Response(JSON.stringify({ error: "Fonds insuffisants ou erreur de déduction" }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        });
      }

      // 2. Appeler PiAPI
      const response = await fetch(SUNO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUNO_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    } 
    
    // ACTION: GENERATE LYRICS
    else if (action === 'generate_lyrics') {
      // Pour les paroles (0.02$), on ne déduit pas de Note entière (ou on pourrait gérer un système séparé)
      const response = await fetch(SUNO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUNO_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // ACTION: GET (Polling)
    else if (action === 'get') {
      if (!taskId) {
        return new Response(JSON.stringify({ error: "taskId manquant" }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        });
      }

      const response = await fetch(`${SUNO_API_URL}/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`
        }
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ error: "Action invalide" }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    });
  }
});
