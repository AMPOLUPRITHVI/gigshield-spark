import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from '@supabase/supabase-js'

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

    const { data: authData, error: authErr } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''))
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

    // Admin stats
    const totalClaims = claims?.length || 0
    const totalPayouts = claims?.reduce((s, c) => s + Number(c.payout), 0) || 0
    const fraudAlerts = claims?.filter(c => c.flagged).length || 0
    const avgRisk = totalClaims > 0 ? Math.round(totalPayouts / totalClaims) : 0

    return new Response(JSON.stringify({
      claims,
      stats: { totalClaims, totalPayouts, fraudAlerts, avgRisk },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
