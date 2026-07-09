import { api } from "@/lib/api";
import type { PublicContactConfig } from "@/lib/contact";
import { DEFAULT_CONTACT_EMAIL, DEFAULT_WHATSAPP_E164, buildWhatsAppUrl } from "@/lib/contact";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";

const FALLBACK: PublicContactConfig = {
  email: DEFAULT_CONTACT_EMAIL,
  whatsapp: DEFAULT_WHATSAPP_E164,
  whatsapp_url: buildWhatsAppUrl(DEFAULT_WHATSAPP_E164),
  payment_link_url: null,
  payment_link_label: "Pay online",
  razorpay_enabled: false,
};

let cached: PublicContactConfig | null = null;

export async function getPublicContactConfig(): Promise<PublicContactConfig> {
  if (cached) return cached;
  try {
    const response = await api<{ data: PublicContactConfig }>("/contact", {
      next: { revalidate: 300 },
    });
    cached = response.data;
    return response.data;
  } catch {
    return FALLBACK;
  }
}

export function openPaymentLink(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (typeof window === "undefined") return false;
  window.open(url.trim(), "_blank", "noopener,noreferrer");
  return true;
}

export async function completeCheckoutPayment(options: {
  token: string;
  payableType: "shop_order" | "tour_booking" | "academy_enrollment";
  payableId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
}): Promise<{ method: "razorpay" | "payment_link" | "none"; paid: boolean }> {
  const contact = await getPublicContactConfig();

  if (contact.razorpay_enabled) {
    try {
      const paid = await openRazorpayCheckout(options);
      if (paid) return { method: "razorpay", paid: true };
    } catch {
      // Fall through to payment link when Razorpay is unavailable.
    }
  }

  if (openPaymentLink(contact.payment_link_url)) {
    return { method: "payment_link", paid: false };
  }

  return { method: "none", paid: false };
}
