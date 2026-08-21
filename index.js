export default {
  async fetch(request, env, ctx) {
    // 1. Define secure headers to stop the "failed to fetch" browser blocks
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Allows your GitHub pages / local HTML to connect
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // 2. Automatically pass browser handshake preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 3. Make sure your secret is correctly loaded in Cloudflare Settings
    if (!env.AIRTABLE_TOKEN) {
      return new Response(JSON.stringify({ error: "Missing AIRTABLE_TOKEN in Cloudflare environment variables." }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // ⚠️ UPDATE THESE CONFIGURATIONS TO MATCH YOUR AIRTABLE SETUP
    const AIRTABLE_BASE_ID = "appR74xXbVcqxglh4"; 
    const AIRTABLE_TABLE_NAME = "Equipment Tracking"; // Case sensitive (e.g., "Inventory" or "Units")

    try {
      const url = `https://airtable.com{AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

      // --- HANDLE LOADING DATA (GET REQUEST) ---
      if (request.method === "GET") {
        const airtableResponse = await fetch(url, {
          headers: { "Authorization": `Bearer ${env.AIRTABLE_TOKEN}` }
        });
        const data = await airtableResponse.json();
        return new Response(JSON.stringify(data), { status: airtableResponse.status, headers: corsHeaders });
      }

      // --- HANDLE SUBMITTING SIGN-OUT DATA (POST REQUEST) ---
      if (request.method === "POST") {
        const body = await request.json();
        
        const airtableResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.AIRTABLE_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
        const data = await airtableResponse.json();
        return new Response(JSON.stringify(data), { status: airtableResponse.status, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: "Method not supported" }), { status: 405, headers: corsHeaders });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};
