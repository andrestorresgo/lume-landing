const PUBLIC_PAYPAL_CLIENT_ID = "AYi_aDPKzTZkjV0x9VUu8h7rEz9VEfR4q2jY0OTMO2n9f841UZ1fyNvdo4hzcBPIhT-HpC-cvd0FD4x5";
const PAYPAL_CLIENT_SECRET = "EMQSMRa6pv4BfypbaXw0a_VPtwv6PS9CsRYJLL645fhmbzkKZ2gTFv0sfO6s30Fw5gEuHFbfG1-2eoyU";
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";
async function getPayPalAccessToken() {
  const credentials = Buffer.from(`${PUBLIC_PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
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
  } catch (err) {
    console.error("Error fetching PayPal access token:", err);
    throw new Error(`Failed to fetch PayPal access token: ${err.message || err}`);
  }
}

export { PAYPAL_API_BASE as P, getPayPalAccessToken as g };
