import type { Product } from "@/lib/catalog/products";
import { formatPrice } from "@/lib/catalog/format";

type CartItem = Product & {
  quantity: number;
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "57TUNUMERO";

export function getProductMessage(product: Product) {
  return `Hola Eliza! Me interesa esta prenda: ${product.nombre} - ${product.precio}. \u00BFA\u00FAn est\u00E1 disponible?`;
}

export function getProductWhatsappUrl(product: Product) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    getProductMessage(product),
  )}`;
}

export function getCartWhatsappUrl(items: CartItem[], total: number) {
  const itemLines = items.map(
    (item) => `\u2022 ${item.nombre} - ${item.precio} x ${item.quantity}`,
  );
  const message = `Hola Eliza! Me interesan estas prendas:\n${itemLines.join(
    "\n",
  )}\n\nTotal: ${formatPrice(total)}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
