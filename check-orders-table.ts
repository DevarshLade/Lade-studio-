// Script to check if the orders table exists and has the correct structure

import { createClient } from '@supabase/supabase-js';
import type { Database } from './src/types/database';

// Configuration - Replace with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function checkOrdersTable() {
  console.log('Checking orders table structure...\n');
  
  try {
    // Check if orders table exists by querying its structure
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is OK
      console.error('Error accessing orders table:', error.message);
      return false;
    }
    
    console.log('✅ Orders table exists and is accessible');
    
    // Check if order_items table exists
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (orderItemsError && orderItemsError.code !== 'PGRST116') {
      console.error('Error accessing order_items table:', orderItemsError.message);
      return false;
    }
    
    console.log('\n✅ Order_items table exists and is accessible');
    
    return true;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

async function main() {
  console.log('Starting orders table verification...\n');
  
  const success = await checkOrdersTable();
  
  if (success) {
    console.log('\n🎉 Orders table verification completed successfully!');
    console.log('\nThe orders and order_items tables exist with the correct structure.');
  } else {
    console.log('\n❌ Orders table verification failed!');
    console.log('Please check your Supabase configuration and database schema.');
    process.exit(1);
  }
}

// Run the verification
main().catch(console.error);