// Utility to test webhooks during development
import { supabaseAdmin } from '@/lib/supabase';

// Test function to simulate an order creation webhook
export async function testOrderWebhook(orderId: string) {
  try {
    // Fetch the order from the database
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (error) {
      console.error('Error fetching order:', error);
      return { success: false, error };
    }
    
    if (!order) {
      console.error('Order not found');
      return { success: false, error: 'Order not found' };
    }
    
    // Create a mock webhook payload
    const payload = {
      type: 'ORDER_CREATED',
      record: order
    };
    
    // In a real implementation, you would send this to your webhook endpoint
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));
    
    return { success: true, payload };
  } catch (error) {
    console.error('Error testing order webhook:', error);
    return { success: false, error };
  }
}

// Test function to simulate a payment completion webhook
export async function testPaymentWebhook(orderId: string) {
  try {
    // Fetch the order from the database
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (error) {
      console.error('Error fetching order:', error);
      return { success: false, error };
    }
    
    if (!order) {
      console.error('Order not found');
      return { success: false, error: 'Order not found' };
    }
    
    // Create a mock webhook payload
    const payload = {
      type: 'PAYMENT_COMPLETED',
      record: {
        ...order,
        payment_status: 'completed'
      }
    };
    
    // In a real implementation, you would send this to your webhook endpoint
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));
    
    return { success: true, payload };
  } catch (error) {
    console.error('Error testing payment webhook:', error);
    return { success: false, error };
  }
}

// Test function to simulate a user creation webhook
export async function testUserWebhook(userId: string) {
  try {
    // This would typically be called with user data from Clerk
    console.log('Testing user webhook for user ID:', userId);
    
    // In a real implementation, you would send this to your webhook endpoint
    const payload = {
      type: 'USER_CREATED',
      record: {
        id: userId,
        // Add other user properties as needed
      }
    };
    
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));
    
    return { success: true, payload };
  } catch (error) {
    console.error('Error testing user webhook:', error);
    return { success: false, error };
  }
}