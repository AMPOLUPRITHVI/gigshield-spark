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
    const userId = authData.claims.sub as string

    const { amount, planName } = await req.json()
    const txnId = `TXN${Math.floor(100000 + Math.random() * 900000)}`

    // Save payment
    const { error: payErr } = await supabase.from('payments').insert({
      user_id: userId,
      txn_id: txnId,
      amount,
      status: 'Success',
    })
    if (payErr) throw payErr

    // Update user plan if provided
    if (planName) {
      await supabase.from('profiles').update({
        plan: planName,
        coverage_active: true,
      }).eq('user_id', userId)
    }

    return new Response(JSON.stringify({
      status: 'Success',
      txnId,
      time: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
