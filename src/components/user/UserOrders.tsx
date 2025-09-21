// Component to display user orders
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { getUserOrders } from '@/lib/services/userService';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
      name: string;
      image_url: string;
    } | null;
  }[];
}

export default function UserOrders() {
  const { user, isAuthenticated, loading: authLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await getUserOrders(user.id);
        
        if (result.success) {
          setOrders(result.data || []);
        } else {
          setError('Failed to fetch orders');
          console.error('Error fetching orders:', result.error);
        }
      } catch (err) {
        setError('An error occurred while fetching orders');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user?.id]);

  if (authLoading || loading) {
    return <div>Loading orders...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in to view your orders.</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (orders.length === 0) {
    return <div>You haven't placed any orders yet.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {order.status}
            </span>
          </div>
          
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                {item.products?.image_url ? (
                  <img 
                    src={item.products.image_url} 
                    alt={item.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.products?.name || 'Product'}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">
                  ${(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <p className="text-lg font-bold">
              Total: ${order.total_amount.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}