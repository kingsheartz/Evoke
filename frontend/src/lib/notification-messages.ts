const EVENT_TITLES: Record<string, string> = {
  "course.enrollment": "Enrollment update",
  "enrollment.status_updated": "Enrollment update",
  "order.placed": "Order confirmed",
  "order.status_updated": "Order update",
  "booking.confirmed": "Tour booking",
  "booking.status_updated": "Booking update",
  "payment.success": "Payment received",
  "certificate.issued": "Certificate ready",
  "attendance.alert": "Attendance update",
  "tour.enquiry": "Tour enquiry",
  "fee.reminder": "Fee reminder",
  "tour.reminder": "Tour reminder",
};

const EVENT_BODIES: Record<string, string> = {
  "course.enrollment": "Your enrollment for {{course}} is {{status}}.",
  "enrollment.status_updated": "Your enrollment for {{course}} is now {{status}}.",
  "order.placed": "Order {{order_number}} placed. Total: ₹{{total}}",
  "order.status_updated": "Order {{order_number}} is now {{status}}.{{tracking_line}}",
  "booking.confirmed": "Booking {{booking_number}} for {{package}} received.",
  "booking.status_updated": "Booking {{booking_number}} for {{package}} is now {{status}}.",
  "payment.success": "Payment of ₹{{amount}} received successfully.",
  "certificate.issued": "Your certificate for {{course}} is ready ({{certificate_number}}).",
  "attendance.alert": "Attendance for {{course}} on {{date}}: {{status}}.",
  "tour.enquiry": "New enquiry from {{name}} ({{email}}).",
  "fee.reminder": "Your fee of ₹{{amount}} for {{course}} is due.",
  "tour.reminder": "Your tour to {{destination}} starts on {{date}}.",
};

function renderTemplate(template: string, payload: Record<string, unknown>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" || typeof value === "number") {
      rendered = rendered.replaceAll(`{{${key}}}`, String(value));
    }
  }

  return rendered.replace(/\{\{[^}]+\}\}/g, "").replace(/\s+/g, " ").trim();
}

export function formatInAppNotification(data: Record<string, unknown>): { title: string; body: string } {
  const event = typeof data.event === "string" ? data.event : "notification";
  const payload =
    data.payload && typeof data.payload === "object" && !Array.isArray(data.payload)
      ? (data.payload as Record<string, unknown>)
      : data;

  const bodyTemplate = EVENT_BODIES[event] ?? "You have a new notification.";
  const title = EVENT_TITLES[event] ?? "Notification";
  const body = renderTemplate(bodyTemplate, payload);

  return { title, body };
}
