import { createClient } from '@supabase/supabase-js';
import { g as getPayPalAccessToken, P as PAYPAL_API_BASE } from './paypalServer_6DundKQD.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return new Response(JSON.stringify({ error: "Missing PayPal orderID." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
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
    const paypalToken = await getPayPalAccessToken();
    const paypalResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${paypalToken}`
      }
    });
    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error("PayPal capture request failed:", errorText);
      return new Response(JSON.stringify({ error: "PayPal payment capture failed." }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }
    const captureData = await paypalResponse.json();
    if (captureData.status !== "COMPLETED") {
      return new Response(JSON.stringify({
        error: `PayPal payment was not completed. Current status: ${captureData.status}`
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: cart, error: cartError } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
    if (cartError || !cart) {
      return new Response(JSON.stringify({ error: "Cart not found." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: cartItems, error: itemsError } = await supabase.from("cart_items").select("quantity, products(id, name, price)").eq("cart_id", cart.id);
    if (itemsError || !cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty. Order could not be created." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let totalAmount = 0;
    const orderItemsToInsert = [];
    for (const item of cartItems) {
      const product = item.products;
      if (product) {
        const price = typeof product.price === "number" ? product.price : parseFloat(product.price);
        totalAmount += price * item.quantity;
        orderItemsToInsert.push({
          product_id: product.id,
          quantity: item.quantity,
          price
        });
      }
    }
    const { data: dbOrder, error: orderInsertError } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: totalAmount,
      status: "completed",
      paypal_order_id: orderID,
      payment_status: "COMPLETED",
      currency: "BOB"
    }).select("id").single();
    if (orderInsertError) {
      console.error("Database order insertion failed:", orderInsertError);
      return new Response(JSON.stringify({ error: "Failed to record order in database." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const orderItemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: dbOrder.id
    }));
    const { error: itemsInsertError } = await supabase.from("order_items").insert(orderItemsWithOrderId);
    if (itemsInsertError) {
      console.error("Database order items insertion failed:", itemsInsertError);
      return new Response(JSON.stringify({ error: "Failed to record order items in database." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { error: cartClearError } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    if (cartClearError) {
      console.error("Failed to clear cart items:", cartClearError);
    }
    return new Response(JSON.stringify({
      success: true,
      orderId: dbOrder.id,
      paypalOrderId: orderID,
      total: totalAmount
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error capturing PayPal order:", err);
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
