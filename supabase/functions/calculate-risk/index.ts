const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rain, temperature, aqi, windSpeed } = await req.json()

    const rainFactor = rain ? 100 : 0
    const tempFactor = temperature > 45 ? 100 : temperature > 38 ? 70 : temperature > 30 ? 40 : 20
    const aqiFactor = aqi > 300 ? 100 : aqi > 200 ? 80 : aqi > 150 ? 60 : aqi > 100 ? 40 : 20
    const windFactor = windSpeed > 20 ? 100 : windSpeed > 15 ? 70 : windSpeed > 10 ? 40 : 20

    const riskScore = Math.round(rainFactor * 0.4 + tempFactor * 0.3 + aqiFactor * 0.2 + windFactor * 0.1)
    const clampedScore = Math.min(100, Math.max(0, riskScore))
    const riskLevel = clampedScore <= 30 ? 'Low' : clampedScore <= 70 ? 'Medium' : 'High'

    return new Response(JSON.stringify({ riskScore: clampedScore, riskLevel }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid input' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
