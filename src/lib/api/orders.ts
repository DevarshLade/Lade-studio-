import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { Order, OrderInsert, OrderItem, OrderItemInsert } from '@/types/database'
import type { CartItem, CheckoutData } from '@/types'

/**
 * Create a new order with order items
 */
export async function createOrder(
  checkoutData: CheckoutData,
  cartItems: CartItem[],
  subtotal: number,
  shippingCost: number = 0
): Promise<{ data: Order | null; error: Error | null }> {
  try {
    // Validate input data
    if (!checkoutData.customerName?.trim()) {
      throw new Error("Customer name is required");
    }
    
    if (!checkoutData.customerPhone?.trim()) {
      throw new Error("Customer phone is required");
    }
    
    if (!checkoutData.shippingAddressLine1?.trim()) {
      throw new Error("Shipping address is required");
    }
    
    if (!checkoutData.shippingCity?.trim()) {
      throw new Error("Shipping city is required");
    }
    
    if (!checkoutData.shippingState?.trim()) {
      throw new Error("Shipping state is required");
    }
    
    if (!checkoutData.shippingPincode?.trim()) {
      throw new Error("Shipping pincode is required");
    }
    
    // Validate phone number format - more permissive validation
    // Allow any 10-digit number instead of requiring specific starting digits
    if (!/^\d{10}$/.test(checkoutData.customerPhone)) {
      throw new Error("Please enter a valid 10-digit phone number");
    }
    
    // Validate pincode format
    if (!/^\d{6}$/.test(checkoutData.shippingPincode)) {
      throw new Error("Please enter a valid 6-digit pincode");
    }
    
    // Ensure payment method is COD (disable online payment)
    if (checkoutData.paymentMethod !== 'cod') {
      throw new Error("Only Cash on Delivery is currently available");
    }
    
    const totalAmount = subtotal + shippingCost

    // Create the order using admin client to bypass RLS policies
    const orderData: OrderInsert = {
      customer_name: checkoutData.customerName,
      customer_phone: checkoutData.customerPhone,
      shipping_address_line1: checkoutData.shippingAddressLine1,
      shipping_address_line2: checkoutData.shippingAddressLine2,
      shipping_city: checkoutData.shippingCity,
      shipping_state: checkoutData.shippingState,
      shipping_pincode: checkoutData.shippingPincode,
      subtotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      payment_method: checkoutData.paymentMethod,
      payment_id: checkoutData.paymentId,
      status: 'Processing'
    }

    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      let errorMessage = orderError.message;
      
      // Provide more user-friendly error messages
      if (orderError.message.includes('constraint')) {
        errorMessage = 'Invalid data provided. Please check your information and try again.';
      } else if (orderError.message.includes('duplicate')) {
        errorMessage = 'An order with this information already exists.';
      }
      
      throw new Error(`Failed to create order: ${errorMessage}`);
    }

    // Create order items using admin client to bypass RLS policies
    const orderItems: OrderItemInsert[] = cartItems.map(item => ({
      order_id: (order as any).id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));

    const { error: itemsError } = await (supabaseAdmin as any)
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // If order items fail, we should delete the order to maintain consistency
      await (supabaseAdmin as any).from('orders').delete().eq('id', (order as any).id);
      
      let errorMessage = itemsError.message;
      
      // Provide more user-friendly error messages
      if (itemsError.message.includes('constraint')) {
        errorMessage = 'Invalid product data. Please try again.';
      } else if (itemsError.message.includes('duplicate')) {
        errorMessage = 'Duplicate order items detected.';
      }
      
      throw new Error(`Failed to create order items: ${errorMessage}`);
    }

    return { data: order as Order, error: null };
  } catch (error) {
    console.error("Order creation error:", error);
    return { data: null, error: error as Error }
  }
}

/**
 * Get order by ID with order items
 */
export async function getOrderById(orderId: string): Promise<{ 
  data: (Order & { order_items: (OrderItem & { products?: any })[] }) | null; 
  error: Error | null 
}> {
  try {
    // First, get the order using admin client
    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return { data: null, error: null }; // Not found
      }
      throw new Error(orderError.message);
    }

    // Get order items for this order with product information using admin client
    const { data: orderItems, error: itemsError } = await (supabaseAdmin as any)
      .from('order_items')
      .select(`
        *,
        products (
          name,
          images
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // Combine order with its items
    const orderWithItems = {
      ...(order as Order),
      order_items: (orderItems as (OrderItem & { products?: any })[]) || []
    };

    return { data: orderWithItems, error: null };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get orders by customer phone
 */
export async function getOrdersByPhone(customerPhone: string): Promise<{ 
  data: (Order & { order_items: OrderItem[] })[] | null; 
  error: Error | null 
}> {
  try {
    // First, get all orders for this phone number using admin client
    const { data: orders, error: ordersError } = await (supabaseAdmin as any)
      .from('orders')
      .select('*')
      .eq('customer_phone', customerPhone)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(ordersError.message);
    }

    // If no orders, return early
    if (!orders || orders.length === 0) {
      return { data: [], error: null };
    }

    // Get all order IDs
    const orderIds = (orders as Order[]).map(order => order.id);

    // Get all order items for these orders using admin client
    const { data: orderItems, error: itemsError } = await (supabaseAdmin as any)
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // Group order items by order ID
    const itemsByOrderId: Record<string, OrderItem[]> = {};
    (orderItems as OrderItem[])?.forEach(item => {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = [];
      }
      itemsByOrderId[item.order_id].push(item);
    });

    // Combine orders with their items
    const ordersWithItems = (orders as Order[]).map(order => ({
      ...order,
      order_items: itemsByOrderId[order.id] || []
    }));

    return { data: ordersWithItems, error: null };
  } catch (error) {
    console.error("Error fetching orders by phone:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get orders for the current authenticated user
 * For Clerk migration, we'll identify users by their phone number or name
 */
export async function getUserOrders(userIdentifier: string): Promise<{ 
  data: (Order & { order_items: (OrderItem & { products?: any })[] })[] | null; 
  error: Error | null 
}> {
  try {
    // Get all orders for this user identifier using admin client
    const { data: orders, error: ordersError } = await (supabaseAdmin as any)
      .from('orders')
      .select('*')
      .or(`customer_phone.eq.${userIdentifier},customer_name.eq.${userIdentifier}`)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(ordersError.message);
    }

    // If no orders, return early
    if (!orders || orders.length === 0) {
      return { data: [], error: null };
    }

    // Get all order IDs
    const orderIds = (orders as Order[]).map(order => order.id);

    // Get all order items for these orders with product information using admin client
    const { data: orderItems, error: itemsError } = await (supabaseAdmin as any)
      .from('order_items')
      .select(`
        *,
        products (
          name,
          images
        )
      `)
      .in('order_id', orderIds);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // Group order items by order ID
    const itemsByOrderId: Record<string, (OrderItem & { products?: any })[]> = {};
    (orderItems as (OrderItem & { products?: any })[])?.forEach(item => {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = [];
      }
      itemsByOrderId[item.order_id].push(item);
    });

    // Combine orders with their items
    const ordersWithItems = (orders as Order[]).map(order => ({
      ...order,
      order_items: itemsByOrderId[order.id] || []
    }));

    return { data: ordersWithItems, error: null };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Cancel an order with a reason
 */
export async function cancelOrder(
  orderId: string,
  cancellationReason: string
): Promise<{ data: Order | null; error: Error | null }> {
  try {
    const { data: order, error } = await (supabaseAdmin as any)
      .from('orders')
      .update({
        status: 'Cancelled',
        cancellation_reason: cancellationReason
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to cancel order: ${error.message}`)
    }

    return { data: order, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}