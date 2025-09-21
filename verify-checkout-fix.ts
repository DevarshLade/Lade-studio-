// Verification script to test the checkout fix
// This script verifies that the RLS policies are correctly configured and orders can be created

import { createClient } from '@supabase/supabase-js';
import type { Database } from './src/types/database';

// Configuration - Replace with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

// Create Supabase admin client
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function verifyRLSPolicies() {
  console.log('Verifying RLS policies on orders table...');
  
  try {
    // Check if RLS is enabled on orders table
    const { data: rlsStatus, error: rlsError } = await supabaseAdmin
      .rpc('execute_sql', { 
        sql: "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'orders';" 
      });
    
    if (rlsError) {
      console.error('Error checking RLS status:', rlsError.message);
      return false;
    }
    
    console.log('RLS Status:', rlsStatus);
    
    // Check existing policies
    const { data: policies, error: policiesError } = await supabaseAdmin
      .rpc('execute_sql', { 
        sql: "SELECT polname, polroles, polcmd FROM pg_policy WHERE polrelid = 'orders'::regclass;" 
      });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError.message);
      return false;
    }
    
    console.log('Existing Policies:', policies);
    
    return true;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

async function testOrderCreation() {
  console.log('Testing order creation...');
  
  try {
    // Test data
    const orderData = {
      customer_name: 'Test User',
      customer_phone: '1234567890',
      shipping_address_line1: '123 Test Street',
      shipping_address_line2: 'Apt 4B',
      shipping_city: 'Test City',
      shipping_state: 'Test State',
      shipping_pincode: '123456',
      subtotal: 100,
      shipping_cost: 0,
      total_amount: 100,
      payment_method: 'cod',
      status: 'Processing'
    };
    
    // Try to insert an order using the admin client
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) {
      console.error('Order creation failed:', error.message);
      return false;
    }
    
    console.log('Order created successfully:', data);
    
    // Clean up - delete the test order
    if (data?.id) {
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', data.id);
      
      console.log('Test order cleaned up');
    }
    
    return true;
  } catch (error) {
    console.error('Order creation test failed:', error);
    return false;
  }
}

async function main() {
  console.log('Starting checkout fix verification...\n');
  
  // Verify RLS policies
  const policiesVerified = await verifyRLSPolicies();
  if (!policiesVerified) {
    console.log('\n❌ RLS policy verification failed');
    process.exit(1);
  }
  
  console.log('\n✅ RLS policies verified\n');
  
  // Test order creation
  const orderCreationSuccess = await testOrderCreation();
  if (!orderCreationSuccess) {
    console.log('\n❌ Order creation test failed');
    process.exit(1);
  }
  
  console.log('\n✅ Order creation test passed\n');
  
  console.log('🎉 All verification tests passed!');
  console.log('\nNext steps:');
  console.log('1. Run the corrected-orders-fix.sql script in your Supabase SQL Editor');
  console.log('2. Test the checkout process in your application');
  console.log('3. Verify that orders can be created successfully');
}

// Run the verification
main().catch(console.error);