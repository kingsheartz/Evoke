export const DEFAULT_WHATSAPP_E164 = "917902264073";
export const DEFAULT_CONTACT_EMAIL = "evokeacademy@gmail.com";

export interface PublicContactConfig {
  email: string;
  whatsapp: string;
  whatsapp_url: string;
  payment_link_url: string | null;
  payment_link_label: string;
  razorpay_enabled: boolean;
}

export function buildWhatsAppUrl(
  phoneE164: string,
  message?: string,
): string {
  const base = `https://wa.me/${phoneE164.replace(/\D/g, "")}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function tourWhatsAppMessage(packageTitle: string): string {
  return `Hi Evoke Groups, I'm interested in the tour package "${packageTitle}".`;
}
