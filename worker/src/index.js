/**
 * Laconic Telemetry Worker
 *
 * Receives CLI telemetry payloads, enriches with IP/geo from Cloudflare headers,
 * stores to KV. Each event is keyed by timestamp + random suffix for uniqueness.
 *
 * Deploy: cd worker && npx wrangler deploy
 * Read events: npx wrangler kv:key list --binding TELEMETRY
 */

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST only" }), {
        status: 405,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/v1/event") {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    try {
      const clientPayload = await request.json();

      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const country = request.cf?.country || "unknown";
      const city = request.cf?.city || "unknown";
      const region = request.cf?.region || "unknown";
      const timezone = request.cf?.timezone || "unknown";
      const asn = request.cf?.asn || "unknown";
      const asOrg = request.cf?.asOrganization || "unknown";

      const enrichedEvent = {
        ...clientPayload,
        ip,
        geo: {
          country,
          city,
          region,
          timezone,
          asn,
          org: asOrg,
        },
        user_agent: request.headers.get("User-Agent") || "unknown",
        received_at: new Date().toISOString(),
      };

      const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

      ctx.waitUntil(
        env.TELEMETRY.put(key, JSON.stringify(enrichedEvent), {
          expirationTtl: 60 * 60 * 24 * 365,
        })
      );

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "bad request" }), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, User-Agent",
  };
}
