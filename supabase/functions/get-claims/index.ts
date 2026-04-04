import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: authData, error: authErr } = await supabase.auth.getClaims(token)
    if (authErr || !authData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const totalClaims = claims?.length || 0
    const totalPayouts = claims?.reduce((s, c) => s + Number(c.payout), 0) || 0
    const fraudAlerts = claims?.filter(c => c.flagged).length || 0

    return new Response(JSON.stringify({
      claims,
      stats: { totalClaims, totalPayouts, fraudAlerts },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
