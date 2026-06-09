import { createClient } from '@supabase/supabase-js';
import { g as getPayPalAccessToken, P as PAYPAL_API_BASE } from './paypalServer_6DundKQD.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = authHeader.split(" ")[1];
    const supabaseUrl = "https://onlhgbvlxqmsaptlvwnr.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubGhnYnZseHFtc2FwdGx2d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDM5NTMsImV4cCI6MjA5NjU3OTk1M30.OZZFM54G3O5ynnhOgbNsu_iJEHYGUYRNp6oMatYYYWc";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Session is invalid." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: cart, error: cartError } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
    if (cartError) {
      return new Response(JSON.stringify({ error: "Database error fetching cart." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!cart) {
      return new Response(JSON.stringify({ error: "Cart is empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: items, error: itemsError } = await supabase.from("cart_items").select("quantity, products(price)").eq("cart_id", cart.id);
    if (itemsError || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items found in the cart." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let serverTotal = 0;
    for (const item of items) {
      const product = item.products;
      if (product && typeof product.price === "number") {
        serverTotal += product.price * item.quantity;
      } else if (product && typeof product.price === "string") {
        serverTotal += parseFloat(product.price) * item.quantity;
      }
    }
    if (serverTotal <= 0) {
      return new Response(JSON.stringify({ error: "Order total must be greater than zero." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const totalUSD = serverTotal / 6.96;
    const paypalToken = await getPayPalAccessToken();
    const paypalResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${paypalToken}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalUSD.toFixed(2)
            }
          }
        ]
      })
    });
    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error("PayPal order creation request failed:", errorText);
      return new Response(JSON.stringify({ error: "PayPal order creation failed." }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }
    const orderData = await paypalResponse.json();
    return new Response(JSON.stringify({ id: orderData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error creating PayPal order:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
