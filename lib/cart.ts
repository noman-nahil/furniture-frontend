const CART_KEY = "ministore-cart";

export type CartItem = {
  productId: string;
  quantity: number;
};

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

function clampQty(q: number, max: number): number {
  if (!Number.isFinite(q)) return 1;
  const hi = Math.max(1, max);
  return Math.min(Math.max(1, Math.floor(q)), hi);
}


function isValidCartItem(item: unknown): item is CartItem {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as CartItem).productId === "string" &&
    (item as CartItem).productId.length > 0 &&
    typeof (item as CartItem).quantity === "number" &&
    Number.isFinite((item as CartItem).quantity) &&
    (item as CartItem).quantity >= 1
  );
}

// ─────────────────────────────────────────────
// Read / write
// ─────────────────────────────────────────────

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
  } catch {
    return [];
  }
}

export function isProductInCart(productId: string): boolean {
  return getCart().some((item) => item.productId === productId);
}

export function setCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart-update", { detail: items }));
}

// ─────────────────────────────────────────────
// Add to cart
// ─────────────────────────────────────────────

export type AddToCartResult =
  | { ok: true; cart: CartItem[] }
  | { ok: false; reason: string };

export function addToCart(item: {
  productId: string;
  quantity?: number;
  maxQuantity?: number;
}): AddToCartResult {
  const requested = item.quantity ?? 1;

  if (!Number.isFinite(requested) || requested < 1) {
    return { ok: false, reason: "Choose a valid quantity." };
  }

  const maxAllowed = item.maxQuantity ?? 999;
  if (maxAllowed < 1) {
    return { ok: false, reason: "This product is out of stock." };
  }

  const cart = getCart();
  const addQty = Math.min(Math.floor(requested), maxAllowed);

  const existingIndex = cart.findIndex((i) => i.productId === item.productId);

  if (existingIndex !== -1) {
    const existing = cart[existingIndex];
    const newQty = clampQty(existing.quantity + addQty, maxAllowed);
    cart[existingIndex] = { ...existing, quantity: newQty };
  } else {
    cart.push({ productId: item.productId, quantity: addQty });
  }

  setCart(cart);
  return { ok: true, cart };
}

// ─────────────────────────────────────────────
// Read helpers
// ─────────────────────────────────────────────

export function getCartItemCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

// ─────────────────────────────────────────────
// Update / remove
// ─────────────────────────────────────────────

export function updateCartItemQuantity(
  productId: string,
  quantity: number,
): CartItem[] {
  const cart = getCart();
  const index = cart.findIndex((i) => i.productId === productId);

  // Item not in cart — nothing to do
  if (index === -1) return cart;

  // quantity < 1 or invalid → treat as remove
  if (!Number.isFinite(quantity) || quantity < 1) {
    const updated = cart.filter((i) => i.productId !== productId);
    setCart(updated);
    return updated;
  }


  cart[index] = { ...cart[index], quantity: Math.floor(quantity) };
  setCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const updated = getCart().filter((i) => i.productId !== productId);
  setCart(updated);
  return updated;
}