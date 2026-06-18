import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, firstName, orderId, total } = await req.json();

    if (!email || !firstName || !orderId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set in environment variables");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Gajanan Gems <onboarding@resend.dev>", // Make sure you verify this domain in Resend
        to: [email],
        subject: `Order Confirmation - Order #${orderId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #3F5C45;">Thank you for your order, ${firstName}!</h1>
            <p>Your order <strong>#${orderId}</strong> has been successfully placed and is confirmed.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Total Amount:</strong> ₹${total.toLocaleString()}</p>
            </div>
            <p>We are getting everything ready. We will notify you once your order is shipped.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>Gajanan Gems Team</strong></p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: res.ok ? 200 : 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
