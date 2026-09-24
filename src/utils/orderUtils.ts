import { Order, OrderStatus } from '../types';

export const FALLBACK_GARMENT_IMAGE =
  'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80';

/**
 * Reusable helper to safely extract ordered products from order object,
 * handling products_json, items, and stringified JSON.
 */
export const extractOrderProducts = (order: any): any[] => {
  if (!order) return [];
  let products = order.products_json || order.items || [];

  if (typeof products === 'string') {
    try {
      products = JSON.parse(products);
    } catch {
      products = [];
    }
  }

  // Handle double-stringified JSON if present
  if (typeof products === 'string') {
    try {
      products = JSON.parse(products);
    } catch {
      products = [];
    }
  }

  return Array.isArray(products) ? products : [];
};

export interface NormalizedOrderProduct {
  id: string;
  name: string;
  image: string;
  size: string;
  colorName: string;
  colorHex?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/**
 * Standardizes raw order status strings to the 5 requested system statuses:
 * - Pending Verification
 * - Approved
 * - Dispatched
 * - Delivered
 * - Rejected
 */
export function normalizeOrderStatus(
  rawStatus?: string
): 'Pending Verification' | 'Approved' | 'Dispatched' | 'Delivered' | 'Rejected' {
  if (!rawStatus) return 'Pending Verification';
  const s = rawStatus.trim().toLowerCase();

  if (s === 'rejected' || s === 'cancelled' || s === 'canceled' || s === 'declined') {
    return 'Rejected';
  }
  if (s === 'delivered' || s === 'completed') {
    return 'Delivered';
  }
  if (s === 'dispatched' || s === 'shipped' || s === 'in_transit' || s === 'in transit') {
    return 'Dispatched';
  }
  if (s === 'approved' || s === 'confirmed' || s === 'processing' || s === 'packed') {
    return 'Approved';
  }
  // Default fallback is Pending Verification
  return 'Pending Verification';
}

/**
 * Normalizes phone numbers by stripping country codes, spaces, dashes, leading zeros
 * for flexible matching (e.g. "+92 300-1234567" matches "03001234567" and "3001234567")
 */
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');
  // If starts with 92 (Pakistan country code), remove 92
  if (digits.startsWith('92') && digits.length >= 10) {
    digits = digits.slice(2);
  }
  // Remove leading 0
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Extracts ordered products from either `products_json` or `items` field.
 */
export function normalizeOrderProducts(order: Order): NormalizedOrderProduct[] {
  let rawList: any[] = [];

  if (Array.isArray(order.items) && order.items.length > 0) {
    rawList = order.items;
  } else if (Array.isArray(order.products_json) && order.products_json.length > 0) {
    rawList = order.products_json;
  } else if (typeof order.products_json === 'string') {
    try {
      const parsed = JSON.parse(order.products_json);
      if (Array.isArray(parsed)) rawList = parsed;
      else if (parsed && typeof parsed === 'object') rawList = [parsed];
    } catch {
      rawList = [];
    }
  } else if (typeof (order as any).items === 'string') {
    try {
      const parsed = JSON.parse((order as any).items);
      if (Array.isArray(parsed)) rawList = parsed;
      else if (parsed && typeof parsed === 'object') rawList = [parsed];
    } catch {
      rawList = [];
    }
  }

  // If still empty but order itself has product fields (flattened single order)
  if (rawList.length === 0 && ((order as any).product_name || (order as any).productName)) {
    rawList = [order];
  }

  return rawList.map((item, index) => {
    if (!item || typeof item !== 'object') {
      return {
        id: `item-${index}`,
        name: String(item || 'Ordered Product'),
        image: FALLBACK_GARMENT_IMAGE,
        size: 'Standard',
        colorName: 'Standard',
        colorHex: undefined,
        quantity: 1,
        unitPrice: 0,
        lineTotal: 0,
      };
    }

    // 1. Product Name
    const name =
      item.product?.name ||
      item.name ||
      item.product_name ||
      item.productName ||
      item.title ||
      item.item_name ||
      `Product #${index + 1}`;

    // 2. Product Image
    let image =
      item.product?.images?.[0] ||
      item.product?.image ||
      item.image ||
      item.product_image ||
      item.productImage ||
      item.selectedColor?.image ||
      item.selected_color?.image ||
      (Array.isArray(item.images) && item.images[0]) ||
      FALLBACK_GARMENT_IMAGE;

    if (!image || typeof image !== 'string' || image.trim() === '') {
      image = FALLBACK_GARMENT_IMAGE;
    }

    // 3. Selected Size
    const size =
      item.selectedSize ||
      item.selected_size ||
      item.size ||
      item.selected_size_name ||
      item.variant?.size ||
      'Standard';

    // 4. Selected Color
    let colorName = 'Standard';
    let colorHex: string | undefined = undefined;

    if (item.selectedColor) {
      if (typeof item.selectedColor === 'string') {
        colorName = item.selectedColor;
      } else if (typeof item.selectedColor === 'object') {
        colorName = item.selectedColor.name || item.selectedColor.color || item.selectedColor.title || 'Standard';
        colorHex = item.selectedColor.hex;
      }
    } else if (item.selected_color) {
      if (typeof item.selected_color === 'string') {
        colorName = item.selected_color;
      } else if (typeof item.selected_color === 'object') {
        colorName = item.selected_color.name || 'Standard';
        colorHex = item.selected_color.hex;
      }
    } else if (item.color) {
      if (typeof item.color === 'string') {
        colorName = item.color;
      } else if (typeof item.color === 'object') {
        colorName = item.color.name || item.color.title || 'Standard';
        colorHex = item.color.hex;
      }
    }

    // 5. Quantity
    const quantity = Math.max(1, Number(item.quantity ?? item.qty ?? item.count ?? item.amount ?? 1) || 1);

    // 6. Unit Price
    let unitPrice = Number(
      item.unitPrice ??
      item.unit_price ??
      item.price ??
      item.product?.price ??
      0
    );

    const rawLineTotal = Number(item.lineTotal ?? item.line_total ?? item.total);
    if ((!unitPrice || unitPrice === 0) && rawLineTotal > 0) {
      unitPrice = Math.round(rawLineTotal / quantity);
    }

    // 7. Line Total
    const lineTotal = rawLineTotal > 0 ? rawLineTotal : unitPrice * quantity;

    return {
      id: String(item.id || item.productId || item.product_id || item.product?.id || `item-${index}`),
      name,
      image,
      size,
      colorName,
      colorHex,
      quantity,
      unitPrice,
      lineTotal,
    };
  });
}

/**
 * Format date for Pakistani customer readability
 */
export function formatOrderDate(dateString?: string): string {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}
/**
 * Converts full CartItem[] into a lightweight payload
 * so products_json never becomes huge / corrupted.
 */
export function toLightweightOrderItems(items: any[]): any[] {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const product = item.product || {};
    const selectedColor = item.selectedColor || {};

    const image =
      selectedColor.image ||
      product.images?.[0] ||
      product.image ||
      item.image ||
      FALLBACK_GARMENT_IMAGE;

    const unitPrice = Number(item.price ?? product.price ?? 0);
    const quantity = Math.max(1, Number(item.quantity ?? 1));

    return {
      id: item.id || `item-${index}`,
      productId: item.productId || product.id || '',
      name: product.name || item.name || `Product #${index + 1}`,
      image: typeof image === 'string' ? image : FALLBACK_GARMENT_IMAGE,
      selectedSize: item.selectedSize || item.size || 'Standard',
      selectedColor: {
        name: selectedColor.name || item.colorName || 'Standard',
        hex: selectedColor.hex || undefined,
      },
      quantity,
      unitPrice,
      price: unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });
}

/**
 * Uploads payment proof image to Supabase Storage and returns public URL.
 * Falls back to null if upload fails (never stores huge base64).
 */
export async function uploadPaymentProof(
  base64OrFile: string | File,
  orderId: string
): Promise<string | null> {
  try {
    const { getSupabase } = await import('../services/supabase');
    const supabase = getSupabase();
    if (!supabase) return null;

    let blob: Blob;
    let ext = 'jpg';

    if (typeof base64OrFile === 'string') {
      const matches = base64OrFile.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) return null;
      const mime = matches[1];
      ext = mime.split('/')[1] || 'jpg';
      const binary = atob(matches[2]);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
      blob = new Blob([array], { type: mime });
    } else {
      blob = base64OrFile;
      ext = base64OrFile.name.split('.').pop() || 'jpg';
    }

    const fileName = `proofs/${orderId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true,
      });

    if (error) {
      console.error('Payment proof upload failed:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('uploadPaymentProof error:', err);
    return null;
  }
}