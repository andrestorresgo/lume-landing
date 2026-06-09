export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { getPayPalAccessToken, PAYPAL_API_BASE } from "../../../lib/paypalServer";

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate user from the Authorization header (Bearer token)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = authHeader.split(" ")[1];
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    // Create client using user's access token to enforce RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // 2. Fetch authenticated user details
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Session is invalid." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Fetch user's cart and calculate subtotal using DB prices (preventing price tampering)
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

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

    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select("quantity, products(price)")
      .eq("cart_id", cart.id);

    if (itemsError || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items found in the cart." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let serverTotal = 0;
    for (const item of items) {
      const product = item.products as any;
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

    // Convert from Bolivianos (BOB) to USD using exchange rate 1 USD = 6.96 BOB
    const totalUSD = serverTotal / 6.96;

    // 4. Retrieve PayPal access token
    const paypalToken = await getPayPalAccessToken();

    // 5. Create PayPal Order
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

  } catch (err: any) {
    console.error("Error creating PayPal order:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
