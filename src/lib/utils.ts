import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from './supabaseClient'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchMenuItems() {
  const { data, error } = await supabase
    .from('menu_items') // use your actual table name
    .select('*');
  if (error) throw error;
  return data;
}
