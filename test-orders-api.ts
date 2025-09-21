// Test script to verify orders API is working correctly
// This script can be run in a Node.js environment with proper Supabase configuration

import { createOrder } from './src/lib/api/orders';
import type { CartItem, CheckoutData } from './src/types';

async function testOrderCreation() {
  try {
    // Mock checkout data
    const checkoutData: CheckoutData = {
      customerName: "Test User",
      customerPhone: "1234567890",
      shippingAddressLine1: "123 Test Street",
      shippingAddressLine2: "Apartment 4B",
      shippingCity: "Test City",
      shippingState: "Test State",
      shippingPincode: "123456",
      paymentMethod: "cod", // Cash on delivery only
      paymentId: null
    };

    // Mock cart items
    const cartItems: CartItem[] = [
      {
        id: "test-product-id-1",
        name: "Test Product 1",
        price: 100,
        quantity: 2,
        image: "test-image-url-1"
      },
      {
        id: "test-product-id-2",
        name: "Test Product 2",
        price: 50,
        quantity: 1,
        image: "test-image-url-2"
      }
    ];

    // Test creating an order
    const result = await createOrder(checkoutData, cartItems, 250, 50);
    
    if (result.error) {
      console.error("Error creating order:", result.error.message);
      return;
    }
    
    console.log("Order created successfully:", result.data);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the test
testOrderCreation();