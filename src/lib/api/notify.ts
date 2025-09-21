import { supabase } from "@/lib/supabase";
import type { ProductNotifyRequest } from "@/types/database";
import { supabaseProductToLegacy } from "@/types";

/**
 * Add a product notification request for when a sold out product becomes available
 * @param productId - The ID of the product
 * @param userEmail - The email of the user requesting notification
 * @param userName - The name of the user requesting notification
 * @returns The inserted notification request or an error
 */
export async function addProductNotificationRequest(
  productId: string,
  userEmail: string,
  userName?: string
) {
  try {
    const { data, error } = await (supabase as any)
      .from('product_notify_requests')
      .insert([{
        product_id: productId,
        user_email: userEmail,
        user_name: userName || userEmail.split('@')[0] || 'Anonymous'
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Check if a user has already requested notification for a product
 * @param productId - The ID of the product
 * @param userEmail - The email of the user
 * @returns Boolean indicating if notification request exists
 */
export async function hasNotificationRequest(
  productId: string,
  userEmail: string
) {
  try {
    const { data, error } = await (supabase as any)
      .from('product_notify_requests')
      .select('id')
      .eq('product_id', productId)
      .eq('user_email', userEmail)
      .maybeSingle();

    if (error) {
      return { hasRequest: false, error };
    }

    return { hasRequest: !!data, error: null };
  } catch (error) {
    return { hasRequest: false, error: error as Error };
  }
}

/**
 * Get all notification requests for a specific product
 * @param productId - The ID of the product
 * @returns Array of notification requests
 */
export async function getProductNotificationRequests(productId: string) {
  try {
    const { data, error } = await (supabase as any)
      .from('product_notify_requests')
      .select('*')
      .eq('product_id', productId)
      .eq('notified', false); // Only get requests that haven't been notified yet

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Mark notification requests as notified
 * @param requestIds - Array of notification request IDs to mark as notified
 * @returns Success status
 */
export async function markNotificationsAsNotified(requestIds: string[]) {
  try {
    const { data, error } = await (supabase as any)
      .from('product_notify_requests')
      .update({ 
        notified: true, 
        notified_at: new Date().toISOString() 
      })
      .in('id', requestIds);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}