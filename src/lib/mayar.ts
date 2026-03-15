const MAYAR_MODE = process.env.MAYAR_MODE || "production";
const MAYAR_BASE_URL = MAYAR_MODE === "sandbox" 
  ? "https://api.mayar.club" 
  : "https://api.mayar.id";

const MAYAR_API_URL = `${MAYAR_BASE_URL}/hl/v1/payment/create`;

export const MAYAR_CONFIG = {
  apiKey: (process.env.MAYAR_API_KEY || "").trim(),
  apiUrl: MAYAR_API_URL,
};

export interface MayarPaymentRequest {
  name: string;
  email: string;
  amount: number;
  mobile: string;
  description: string;
  redirectURL: string;
  expiredAt: string;
  callbackURL?: string;
  metadata?: Record<string, any>;
}

export async function createMayarPaymentLink(params: MayarPaymentRequest) {
  if (!MAYAR_CONFIG.apiKey) {
    throw new Error("MAYAR_API_KEY is not configured");
  }

  const response = await fetch(MAYAR_CONFIG.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MAYAR_CONFIG.apiKey}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[MAYAR_API_ERROR]", data);
    throw new Error(data.message || "Failed to create payment link");
  }

  return data; // Usually contains link, id, etc.
}
