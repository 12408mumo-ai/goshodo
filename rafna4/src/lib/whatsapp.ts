import { WHATSAPP_NUMBER } from "./env";
import { formatKES } from "./format";

export interface OrderDetails {
  productTitle: string;
  price: number;
  fulfillment: "delivery" | "pickup";
  location: string;
  name: string;
  phone: string;
}

/** Builds the exact WhatsApp order message required by the business. */
export function buildOrderMessage(order: OrderDetails): string {
  const isDelivery = order.fulfillment === "delivery";
  return [
    "Hello Rafna Investment, I would like to order:",
    "",
    `Product: ${order.productTitle}`,
    `Price: ${formatKES(order.price)}`,
    `Fulfillment: ${isDelivery ? "Delivery" : "Shop Pick Up"}`,
    `Location: ${isDelivery ? order.location : "Kamkunji Pick Up"}`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
  ].join("\n");
}

/** Fully URL-encoded click-to-chat link. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function enquiryWhatsAppUrl(): string {
  return buildWhatsAppUrl(
    "Hello Rafna Investment, I would like to make an enquiry.",
  );
}
