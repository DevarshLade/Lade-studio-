"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from '@clerk/nextjs';
import { getOrderById } from "@/lib/api/orders";
import type { Order, OrderItem } from "@/types/database";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CancelOrderDialog } from "@/components/order/CancelOrderDialog";
import Image from "next/image";

type OrderWithItems = Order & { order_items: (OrderItem & { products?: any })[] };

function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!id || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await getOrderById(id as string);
        
        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError("Order not found");
          return;
        }

        // Check if the order belongs to the current user
        const userPhone = user.phoneNumbers?.[0]?.phoneNumber || '';
        const userEmail = user.emailAddresses?.[0]?.emailAddress || '';
        
        if (data.customer_phone !== userPhone && data.customer_name !== userEmail) {
          setError("You don't have permission to view this order");
          return;
        }

        setOrder(data);
      } catch (err) {
        setError("Failed to load order details");
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, user]);

  const handleCancelOrder = () => {
    setCancelDialogOpen(true);
  };

  const canCancelOrder = (status: string) => {
    return status?.toLowerCase() === 'processing';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'on the way':
        return 'bg-purple-100 text-purple-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <Button asChild>
                <Link href="/my-account">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button asChild>
                <Link href="/my-account">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-4">
          <Link href="/my-account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-headline">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="font-headline">Order #{order.id.split('-')[0].toUpperCase()}</CardTitle>
                  <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <div className="space-y-4">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        {item.products?.images?.[0] ? (
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={item.products.images[0]}
                              alt={item.products.name || "Product image"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        )}
                        <div className="flex-grow">
                          <h4 className="font-medium">{item.products?.name || "Product"}</h4>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="font-medium">
                          ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{order.shipping_cost.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.customer_name}</p>
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                <p>Phone: {order.customer_phone}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Payment Method: <span className="capitalize">{order.payment_method.replace('_', ' ')}</span></p>
                {order.payment_id && <p>Payment ID: {order.payment_id}</p>}
              </div>
            </CardContent>
          </Card>
          
          {canCancelOrder(order.status) && (
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
      
      <CancelOrderDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        order={order}
        onCancelled={() => window.location.reload()}
      />
    </div>
  );
}

export default function OrderDetailWrapper() {
  return (
    <ProtectedRoute>
      <OrderDetailPage />
    </ProtectedRoute>
  );
}