// Server-side PayPal helpers. This file must ONLY be imported in server code (e.g. Astro API endpoints)
// as it relies on the server-only PAYPAL_CLIENT_SECRET variable.

export const PUBLIC_PAYPAL_CLIENT_ID = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID;
export const PAYPAL_CLIENT_SECRET = import.meta.env.PAYPAL_CLIENT_SECRET;
export const PUBLIC_PAYPAL_ENV = import.meta.env.PUBLIC_PAYPAL_ENV || "sandbox";

// Startup checks
if (!PUBLIC_PAYPAL_CLIENT_ID) {
  throw new Error("Missing environment variable: PUBLIC_PAYPAL_CLIENT_ID is required for PayPal integration.");
}

if (!PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing environment variable: PAYPAL_CLIENT_SECRET is required on the server for payment verification. Keep this secret safe!");
}

if (PUBLIC_PAYPAL_ENV !== "sandbox") {
  throw new Error(`Invalid PUBLIC_PAYPAL_ENV: '${PUBLIC_PAYPAL_ENV}'. Only 'sandbox' environment is allowed for this application.`);
}

// Hardcoded Sandbox Base URL
export const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

/**
 * Retrieves an OAuth 2.0 access token from PayPal Sandbox using basic authentication.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${PUBLIC_PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal OAuth2 token exchange failed:", errorText);
      throw new Error(`PayPal Auth Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("PayPal response did not contain an access_token.");
    }

    return data.access_token;
  } catch (err: any) {
    console.error("Error fetching PayPal access token:", err);
    throw new Error(`Failed to fetch PayPal access token: ${err.message || err}`);
  }
}
