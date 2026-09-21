import { Product, CartItem } from '../types';

export const MANI_MINARS_WHATSAPP_NUMBER = '923046466815';

/**
 * Builds direct WhatsApp URL for a single product order
 */
export function buildProductWhatsAppUrl(
  product: Product,
  selectedSize: string,
  selectedColorName: string,
  quantity: number
): string {
  const totalPrice = product.price * quantity;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const message = `Assalam-o-Alaikum Mani Minars! 👋
I would like to place a direct order for:

🛍️ *Product:* ${product.name}
🏷️ *Age Group:* ${product.ageGroup === 'kids' ? 'Little Loom Kids (0–10Y)' : 'Little Loom Juniors (11–16Y)'}
📏 *Size:* ${selectedSize}
🎨 *Color:* ${selectedColorName}
🔢 *Quantity:* ${quantity}
💰 *Total Price:* PKR ${totalPrice.toLocaleString()}
${currentUrl ? `🔗 *Product Link:* ${currentUrl}\n` : ''}
Please confirm item availability and dispatch timeline. Shukriya!`;

  return `https://wa.me/${MANI_MINARS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds direct WhatsApp URL for entire shopping bag / cart
 */
export function buildCartWhatsAppUrl(
  items: CartItem[],
  total: number,
  deliveryFee: number
): string {
  const itemsText = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}*\n   • Size: ${item.selectedSize} | Color: ${item.selectedColor.name}\n   • Qty: ${item.quantity} x PKR ${item.price.toLocaleString()} = PKR ${(item.price * item.quantity).toLocaleString()}`
    )
    .join('\n\n');

  const deliveryText = deliveryFee === 0 ? 'FREE (Special Offer)' : `PKR ${deliveryFee}`;

  const message = `Assalam-o-Alaikum Mani Minars! 👋
I would like to place an order for my shopping bag:

📦 *ORDER ITEMS:*
${itemsText}

-------------------------
🚚 *Delivery:* ${deliveryText}
💰 *Total Payable:* PKR ${total.toLocaleString()}

Please confirm my order and dispatch timeline. Shukriya!`;

  return `https://wa.me/${MANI_MINARS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
