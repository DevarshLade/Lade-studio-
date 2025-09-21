// Webhook service to handle events from Clerk
// Note: This service syncs Clerk users to Supabase for database operations

import { supabaseAdmin, isSupabaseConfigured, hasSupabaseAdmin } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Handle order creation event
export async function handleOrderCreated(order: any) {
  console.log('Processing order created event:', order);
  
  try {
    // Order processing logic
    console.log('Order created event processed');
    
    return { success: true, data: order };
  } catch (error) {
    console.error('Error handling order created event:', error);
    return { success: false, error };
  }
}

// Handle payment completion event
export async function handlePaymentCompleted(payment: any) {
  console.log('Processing payment completed event:', payment);
  
  try {
    // Payment processing logic
    console.log('Payment completed event processed');
    
    return { success: true, data: payment };
  } catch (error) {
    console.error('Error handling payment completed event:', error);
    return { success: false, error };
  }
}

// Sync user data from Clerk to Supabase users table
export async function syncUserToSupabase(userData: any) {
  // If Supabase is not configured, skip syncing
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping user sync');
    return { success: true, data: null };
  }

  // If supabaseAdmin is not available, return early
  if (!hasSupabaseAdmin()) {
    console.log('Supabase admin client not available, skipping user sync');
    return { success: true, data: null };
  }

  console.log('Syncing user data to Supabase:', userData);
  
  try {
    // Extract user information from Clerk webhook data
    const userId = userData.id;
    const email = userData.email_addresses?.[0]?.email_address || '';
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    const createdAt = userData.created_at ? new Date(userData.created_at).toISOString() : new Date().toISOString();
    const updatedAt = new Date().toISOString();
    
    // Insert or update user in Supabase users table
    const result = await (supabaseAdmin as SupabaseClient)
      .from('users')
      .upsert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        created_at: createdAt,
        updated_at: updatedAt
      }, {
        onConflict: 'id'
      })
      .select()
      .single();
      
    if (result.error) {
      console.error('Error syncing user to Supabase:', result.error);
      throw result.error;
    }
    
    console.log('User synced to Supabase:', result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error syncing user:', error);
    return { success: false, error };
  }
}

// Handle user deletion - remove user from Supabase
export async function handleUserDeleted(userId: string) {
  // If Supabase is not configured, skip deletion
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping user deletion');
    return { success: true };
  }

  // If supabaseAdmin is not available, return early
  if (!hasSupabaseAdmin()) {
    console.log('Supabase admin client not available, skipping user deletion');
    return { success: true };
  }

  console.log('Handling user deletion from Supabase:', userId);
  
  try {
    // Delete user from users table
    const userResult = await (supabaseAdmin as SupabaseClient)
      .from('users')
      .delete()
      .eq('id', userId);
      
    if (userResult.error) {
      console.error('Error deleting user from users table:', userResult.error);
      throw userResult.error;
    }
    
    // Optionally mark user's orders as deleted instead of removing them
    const ordersResult = await (supabaseAdmin as SupabaseClient)
      .from('orders')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
      
    if (ordersResult.error) {
      console.error('Error marking user orders as deleted:', ordersResult.error);
      // Don't throw here as we still want to complete the user deletion
    }
    
    console.log('User deleted successfully from Supabase:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error handling user deletion:', error);
    return { success: false, error };
  }
}

// Get user ID from Clerk and fetch user data from Supabase
export async function getUserFromSupabase(clerkUserId: string) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot fetch user data');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabaseAdmin is not available, return early
  if (!hasSupabaseAdmin()) {
    console.log('Supabase admin client not available, cannot fetch user data');
    return { success: false, error: new Error('Supabase admin client not available') };
  }

  try {
    const result = await (supabaseAdmin as SupabaseClient)
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .single();
      
    if (result.error) {
      console.error('Error fetching user from Supabase:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
    return { success: false, error };
  }
}