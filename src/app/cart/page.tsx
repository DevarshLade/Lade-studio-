"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; // Remove default shipping charge
  const total = subtotal + shipping;

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      router.push('/checkout');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-headline text-center mb-12">Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-12">
        {/* Cart Items List */}
        <div className="md:col-span-2 space-y-6">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <Card key={item.id} className="flex items-center p-4">
                <Image 
                  src={item.images[0]} 
                  alt={item.name} 
                  width={80} 
                  height={80} 
                  className="rounded-md object-cover" 
                  data-ai-hint={item.aiHint}
                  loading="lazy"
                  quality={80}
                />
                <div className="ml-4 flex-grow">
                  <Link href={`/product/${item.slug}`} className="font-headline text-lg hover:underline">{item.name}</Link>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex items-center border rounded-md mx-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <p className="w-24 text-right font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                <Button variant="ghost" size="icon" className="ml-4 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
                <p className="text-xl text-muted-foreground">Your cart is empty.</p>
                <Button asChild className="mt-4">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full" 
                disabled={cartItems.length === 0}
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}