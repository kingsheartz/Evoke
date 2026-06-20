import { apiClient } from "@/lib/api";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: {
  token: string;
  payableType: "shop_order" | "tour_booking" | "academy_enrollment";
  payableId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
}): Promise<boolean> {
  const response = await apiClient.createPaymentOrder(options.token, {
    payable_type: options.payableType,
    payable_id: options.payableId,
  });

  const { configured, razorpay } = response.data;
  if (!configured || !razorpay) {
    return false;
  }

  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: razorpay.key,
      amount: razorpay.amount,
      currency: razorpay.currency,
      name: "Evoke",
      description: response.data.receipt,
      order_id: razorpay.order_id,
      prefill: {
        name: options.userName,
        email: options.userEmail,
        contact: options.userPhone ?? "",
      },
      handler: async (payment: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await apiClient.verifyPayment(options.token, {
            payable_type: options.payableType,
            payable_id: options.payableId,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          });
          resolve(true);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => resolve(false),
      },
    });

    checkout.open();
  });
}
