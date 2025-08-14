import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from '@/lib/supabaseClient';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function addToCart(cartItem: {
  user_id: string;
  menu_item_id: string;
  quantity: number;
  order_type: string;
  spice_level?: string;
  table_number?: string;
  price: number;
}) {
  // Try to increment quantity if item exists
  const { data: existing, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', cartItem.user_id)
    .eq('menu_item_id', cartItem.menu_item_id)
    .eq('order_type', cartItem.order_type)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existing) {
    // Increment quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + cartItem.quantity })
      .eq('id', existing.id);
    if (error) throw error;
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('cart_items')
      .upsert([cartItem])
      .select();
    if (error) throw error;
    return data;
  }
}

export async function fetchCartItems(user_id) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, menu_items!cart_items_menu_item_id_fkey(*)')
    .eq('user_id', user_id);
  if (error) throw error;
  return data;
}

export async function updateCartQuantity({ user_id, menu_item_id, order_type, quantity }) {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', user_id)
    .eq('menu_item_id', menu_item_id)
    .eq('order_type', order_type);
  if (error) throw error;
  return data;
}
