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

    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''))
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userId = claims.claims.sub as string

    const { income, lossPercentage, type, riskScore } = await req.json()

    // Fraud check: no risk
    if (riskScore !== undefined && riskScore < 10) {
      return new Response(JSON.stringify({ error: 'No significant risk detected. Claim blocked.', fraudBlocked: true }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fraud check: rapid claims (check last claim within 30s)
    const { data: recentClaims } = await supabase
      .from('claims')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (recentClaims && recentClaims.length > 0) {
      const lastTime = new Date(recentClaims[0].created_at).getTime()
      if (Date.now() - lastTime < 30000) {
        return new Response(JSON.stringify({ error: 'Multiple claims in quick succession. Please wait.', fraudBlocked: true }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const payout = Math.round(income * (lossPercentage / 100))
    const txnId = `TXN${Math.floor(100000 + Math.random() * 900000)}`

    // Insert claim
    const { data: claim, error: insertErr } = await supabase.from('claims').insert({
      user_id: userId,
      type: type || 'Rain Claim',
      amount: income,
      payout,
      txn_id: txnId,
      status: 'Credited',
      flagged: false,
    }).select().single()

    if (insertErr) throw insertErr

    // Insert payment
    await supabase.from('payments').insert({
      user_id: userId,
      txn_id: txnId,
      amount: payout,
      status: 'Success',
    })

    return new Response(JSON.stringify({
      claimId: claim.id,
      payout,
      txnId,
      timestamp: claim.created_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
