import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Protobuf message factory (simplified version from original)
function createProtobufDecoder() {
  // This is a simplified decoder that matches the original structure
  return {
    decode: (buffer: Uint8Array) => {
      // For now, return mock data structure - in production you'd implement the full protobuf decoder
      return {
        games: []
      };
    }
  };
}

function decodeSignedValue(value: number): number {
  if (value > (1 << 63)) {
    value -= 1 << 64;
  }
  return value;
}

function prioritizeGames(games: any[]): any[] {
  const sortedGames = games.sort((a, b) => (a.extra || 0) - (b.extra || 0));
  
  return sortedGames.map(game => {
    const extraVal = game.extra || 0;
    let prioridade = "✅ Neutra ou positiva";
    
    if (extraVal <= -200) {
      prioridade = "🔥 Alta prioridade";
    } else if (extraVal < 0) {
      prioridade = "⚠️ Média prioridade";
    }
    
    return { ...game, prioridade };
  });
}

async function fetchGamesFromAPI(): Promise<any[]> {
  const url = "https://cgg.bet.br/casinogo/widgets/v2/live-rtp";
  const headers = {
    "accept": "application/x-protobuf",
    "content-type": "application/x-protobuf",
    "x-language-iso": "pt-BR",
    "origin": "https://cgg.bet.br",
    "referer": "https://cgg.bet.br/pt-BR/casinos/casino/lobby",
  };
  
  const data = new Uint8Array([0x08, 0x01, 0x10, 0x02]);
  const dataWeekly = new Uint8Array([0x08, 0x02, 0x10, 0x02]);
  
  try {
    // Fetch daily data
    const dailyResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: data,
    });
    
    // Fetch weekly data
    const weeklyResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: dataWeekly,
    });
    
    if (!dailyResponse.ok || !weeklyResponse.ok) {
      throw new Error('Failed to fetch games data');
    }
    
    // In a real implementation, you'd decode the protobuf response here
    // For now, returning sample data that matches the expected structure
    const sampleGames = [
      {
        id: 1001,
        name: "Sweet Bonanza",
        provider: { name: "Pragmatic Play", slug: "pragmatic-play" },
        image: "https://cgg.bet.br/static/v1/casino/game/0/1001/big.webp",
        rtp: 9620,
        extra: -150,
        rtp_semana: 9580,
        extra_semana: -200,
        rtp_status: "down",
        status_semana: "down"
      },
      {
        id: 1002,
        name: "Gates of Olympus",
        provider: { name: "Pragmatic Play", slug: "pragmatic-play" },
        image: "https://cgg.bet.br/static/v1/casino/game/0/1002/big.webp",
        rtp: 9640,
        extra: 50,
        rtp_semana: 9630,
        extra_semana: 30,
        rtp_status: "up",
        status_semana: "up"
      }
    ];
    
    return sampleGames.map(game => ({
      ...game,
      provider_name: game.provider.name,
      provider_slug: game.provider.slug,
      image_url: game.image,
      extra: decodeSignedValue(game.extra),
      extra_semana: decodeSignedValue(game.extra_semana)
    }));
    
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') || 'live';
    
    // Fetch fresh data from API
    const games = await fetchGamesFromAPI();
    
    // Update cache in database
    for (const game of games) {
      await supabase
        .from('games')
        .upsert({
          id: game.id,
          name: game.name,
          provider_name: game.provider_name,
          provider_slug: game.provider_slug,
          image_url: game.image_url,
          rtp: game.rtp,
          extra: game.extra,
          rtp_semana: game.rtp_semana,
          extra_semana: game.extra_semana,
          rtp_status: game.rtp_status,
          status_semana: game.status_semana,
          cached_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
    }
    
    const responseData = mode === 'melhores' ? prioritizeGames(games) : games;
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
    
  } catch (error) {
    console.error('Error in fetch-games function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch games' }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});