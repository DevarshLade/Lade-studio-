"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/cart-context";
import { useUser } from '@clerk/nextjs';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/api/orders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { CheckoutData } from "@/types";


function AddressForm({ formData, setFormData, errors, setErrors, validateField }: { 
    formData: CheckoutData; 
    setFormData: (data: CheckoutData) => void; 
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    validateField: (field: keyof CheckoutData, value: string) => string;
}) {
    const handleInputChange = (field: keyof CheckoutData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Clean phone number and pincode inputs
        if (field === 'customerPhone') {
            // Only allow digits
            value = value.replace(/\D/g, '');
            // Limit to 10 digits
            if (value.length > 10) value = value.substring(0, 10);
        } else if (field === 'shippingPincode') {
            // Only allow digits
            value = value.replace(/\D/g, '');
            // Limit to 6 digits
            if (value.length > 6) value = value.substring(0, 6);
        }
        
        setFormData({ ...formData, [field]: value });
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle field blur to show validation errors
    const handleFieldBlur = (field: keyof CheckoutData) => {
        // Clean the value before validation
        let value = formData[field] || '';
        if (field === 'customerPhone') {
            value = value.replace(/\D/g, '');
        } else if (field === 'shippingPincode') {
            value = value.replace(/\D/g, '');
        }
        
        // Update the form data with cleaned value
        if (value !== formData[field]) {
            setFormData({ ...formData, [field]: value });
        }
        
        // For blur events, be more strict with validation
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, [field]: 'This field is required' }));
            return;
        }
        
        const error = validateField(field, value);
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                        id="name" 
                        placeholder="Your full name" 
                        value={formData.customerName}
                        onChange={handleInputChange('customerName')}
                        onBlur={() => handleFieldBlur('customerName')}
                        required
                    />
                    {errors.customerName && (
                        <p className="text-sm text-destructive">{errors.customerName}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                        id="phone" 
                        placeholder="Your phone number" 
                        value={formData.customerPhone || ''}
                        onChange={handleInputChange('customerPhone')}
                        onBlur={() => handleFieldBlur('customerPhone')}
                        required
                    />
                    {errors.customerPhone && (
                        <p className="text-sm text-destructive">{errors.customerPhone}</p>
                    )}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address Line 1 *</Label>
                    <Input 
                        id="address" 
                        placeholder="Street address, apartment, etc." 
                        value={formData.shippingAddressLine1}
                        onChange={handleInputChange('shippingAddressLine1')}
                        onBlur={() => handleFieldBlur('shippingAddressLine1')}
                        required
                    />
                    {errors.shippingAddressLine1 && (
                        <p className="text-sm text-destructive">{errors.shippingAddressLine1}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input 
                        id="address2" 
                        placeholder="Apartment, suite, unit, building, floor, etc." 
                        value={formData.shippingAddressLine2 || ''}
                        onChange={handleInputChange('shippingAddressLine2')}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input 
                            id="city" 
                            placeholder="City" 
                            value={formData.shippingCity}
                            onChange={handleInputChange('shippingCity')}
                            onBlur={() => handleFieldBlur('shippingCity')}
                            required
                        />
                        {errors.shippingCity && (
                            <p className="text-sm text-destructive">{errors.shippingCity}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input 
                            id="state" 
                            placeholder="State" 
                            value={formData.shippingState}
                            onChange={handleInputChange('shippingState')}
                            onBlur={() => handleFieldBlur('shippingState')}
                            required
                        />
                        {errors.shippingState && (
                            <p className="text-sm text-destructive">{errors.shippingState}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input 
                            id="pincode" 
                            placeholder="Pincode" 
                            value={formData.shippingPincode || ''}
                            onChange={handleInputChange('shippingPincode')}
                            onBlur={() => handleFieldBlur('shippingPincode')}
                            required
                        />
                        {errors.shippingPincode && (
                            <p className="text-sm text-destructive">{errors.shippingPincode}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
function PaymentOptions({ selectedMethod, onMethodChange, totalDeliveryCharges } : { selectedMethod: string, onMethodChange: (value: string) => void, totalDeliveryCharges: number }) {
    return (
        <div>
            <Label className="text-lg font-headline mb-4 block">Payment Method</Label>
            <div className="space-y-4">
                {/* Disable online payment option */}
                <Label htmlFor="razorpay" className="p-4 flex items-center gap-4 border rounded-lg cursor-not-allowed bg-gray-100 opacity-50 relative">
                    <RadioGroupItem value="razorpay" id="razorpay" disabled />
                    <div className="flex-grow">
                        <span className="font-medium block">Online Payment (Razorpay) <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">Coming Soon</span></span>
                        <span className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Netbanking <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">Coming Soon</span></span>
                    </div>
                </Label>
                <Label htmlFor="cod" className="p-4 flex items-center gap-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value="cod" id="cod" />
                    <div className="flex-grow">
                        <span className="font-medium block">Cash on Delivery</span>
                        <span className="text-sm text-muted-foreground">Pay when your order is delivered</span>
                    </div>
                </Label>
            </div>
        </div>
    );
}

function CheckoutForm() {
    const { cartItems, clearCart } = useCart();
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to COD and only option
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CheckoutData>({
        customerName: '',
        customerPhone: '',
        shippingAddressLine1: '',
        shippingAddressLine2: '',
        shippingCity: '',
        shippingState: '',
        shippingPincode: '',
        paymentMethod: 'cod' // Always COD
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper function to get field labels
    const getFieldLabel = (field: string) => {
        switch (field) {
            case 'customerName': return 'Name';
            case 'customerPhone': return 'Phone number';
            case 'shippingAddressLine1': return 'Address';
            case 'shippingCity': return 'City';
            case 'shippingState': return 'State';
            case 'shippingPincode': return 'Pincode';
            default: return field;
        }
    };

    // Validation function for individual fields
    const validateField = (field: keyof CheckoutData, value: string) => {
        switch (field) {
            case 'customerName':
                if (!value?.trim()) return 'Name is required';
                if (value.length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'customerPhone':
                if (!value?.trim()) return 'Phone number is required';
                // Clean the phone number by removing any non-digit characters
                const cleanPhone = value.replace(/\D/g, '');
                // Very permissive validation - just check it's 10 digits
                if (cleanPhone.length !== 10) return 'Please enter a 10-digit phone number';
                return '';
            case 'shippingAddressLine1':
                if (!value?.trim()) return 'Address is required';
                return '';
            case 'shippingCity':
                if (!value?.trim()) return 'City is required';
                return '';
            case 'shippingState':
                if (!value?.trim()) return 'State is required';
                return '';
            case 'shippingPincode':
                if (!value?.trim()) return 'Pincode is required';
                // Clean the pincode by removing any non-digit characters
                const cleanPincode = value.replace(/\D/g, '');
                if (cleanPincode.length === 0) return ''; // Don't validate empty field
                if (cleanPincode.length < 6) return 'Pincode must be 6 digits';
                if (cleanPincode.length > 6) return 'Pincode must be exactly 6 digits';
                return '';
            default:
                return '';
        }
    };

    // Pre-fill form with user data when available
    useEffect(() => {
        if (user) {
            // Clean phone number if it exists
            let cleanPhone = user.phoneNumbers?.[0]?.phoneNumber || '';
            if (cleanPhone) {
                cleanPhone = cleanPhone.replace(/\D/g, '');
                // Limit to 10 digits
                if (cleanPhone.length > 10) cleanPhone = cleanPhone.substring(0, 10);
            }
            
            setFormData(prev => ({
                ...prev,
                customerName: user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.emailAddresses[0]?.emailAddress?.split('@')[0] || '',
                customerPhone: cleanPhone,
                paymentMethod: 'cod' // Always set to COD
            }));
        }
    }, [user]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Remove delivery charges - set to 0
    const totalDeliveryCharges = 0;
    const shipping = 0; // Remove base shipping cost
    
    // For COD: ask for delivery charges as advance, add to total
    // For online payment: add delivery charges to total amount
    const advanceDeliveryCharge = 0;
    const totalDeliveryInAmount = 0;
    const total = subtotal + shipping + totalDeliveryInAmount + advanceDeliveryCharge;

    // Validation function
    const validateForm = (): boolean => {
        // Create a copy of formData to work with
        let updatedFormData = { ...formData };
        
        // Clean phone number and pincode in the copy
        if (updatedFormData.customerPhone) {
            updatedFormData.customerPhone = updatedFormData.customerPhone.replace(/\D/g, '');
        }
        if (updatedFormData.shippingPincode) {
            updatedFormData.shippingPincode = updatedFormData.shippingPincode.replace(/\D/g, '');
        }
        
        const requiredFields = [
            'customerName',
            'customerPhone', 
            'shippingAddressLine1',
            'shippingCity',
            'shippingState',
            'shippingPincode'
        ] as const;
        
        let hasErrors = false;
        const newErrors: Record<string, string> = {};
        
        // Check all required fields using the cleaned data
        for (const field of requiredFields) {
            // Use the cleaned values
            let value = updatedFormData[field] || '';
            
            console.log('Validation - field:', field, 'value:', value); // Debug log
            
            // For form submission, all fields are required
            if (!value.trim()) {
                newErrors[field] = 'This field is required';
                hasErrors = true;
                console.log('Field is empty:', field); // Debug log
                continue;
            }
            
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
                console.log('Field validation error:', field, 'error:', error); // Debug log
            }
        }
        
        if (hasErrors) {
            setErrors(newErrors);
            // Create a more descriptive error message
            const errorFields = Object.keys(newErrors).join(', ');
            toast({
                title: "Please correct the errors below",
                description: `The following fields require your attention: ${errorFields}`,
                variant: "destructive"
            });
            return false;
        }
        
        // Update form data with cleaned values if they've changed
        if (updatedFormData.customerPhone !== formData.customerPhone || 
            updatedFormData.shippingPincode !== formData.shippingPincode) {
            setFormData(updatedFormData);
        }
        
        return true;
    };
    
    // This function loads the Razorpay script
    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        
        try {
            // Update form data with selected payment method (always COD)
            const orderData = { ...formData, paymentMethod: 'cod' };
            
            // Ensure phone number is clean before sending to API
            if (orderData.customerPhone) {
                orderData.customerPhone = orderData.customerPhone.replace(/\D/g, '');
            }
            
            // Handle Cash on Delivery - create order directly
            // Cart items are already in the correct format
            const orderCartItems = cartItems;
            
            const { data: order, error } = await createOrder(
                orderData,
                orderCartItems,
                subtotal,
                0 // No delivery charges
            );
            
            if (error) {
                throw new Error(`Failed to place order: ${error.message}`);
            }
            
            toast({ 
                title: "Order Placed!", 
                description: `Your order #${order?.id?.slice(0, 8)} has been successfully placed with Cash on Delivery.` 
            });
            clearCart();
            router.push('/my-account');
        } catch (error) {
            console.error("Checkout error:", error);
            toast({
                title: "Checkout Error",
                description: (error as Error).message || "An unexpected error occurred during checkout. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl md:text-5xl font-headline text-center mb-12">Checkout</h1>
            {cartItems.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-xl text-muted-foreground">Your cart is empty. You can't proceed to checkout.</p>
                    <Button asChild className="mt-4">
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left side: Form */
}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">1. Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AddressForm 
                                    formData={formData} 
                                    setFormData={setFormData} 
                                    errors={errors}
                                    setErrors={setErrors}
                                    validateField={validateField}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">2. Confirm Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PaymentOptions selectedMethod={paymentMethod} onMethodChange={setPaymentMethod} totalDeliveryCharges={totalDeliveryCharges} />
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Right side: Order Summary */
}
                    <div>
                    <Card className="sticky top-20">
                        <CardHeader>
                        <CardTitle className="font-headline text-2xl">Your Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Image 
                                              src={item.images[0]} 
                                              alt={item.name} 
                                              width={60} 
                                              height={60} 
                                              className="rounded-md object-cover" 
                                              data-ai-hint={item.aiHint} 
                                              loading="lazy"
                                              quality={80}
                                            />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-6" />
                            <div className="space-y-2">
                            <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                        <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Place Order'}
                        </Button>
                        </CardFooter>
                    </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <ProtectedRoute 
            title="Sign in to Complete Your Purchase"
            description="Please sign in to proceed with checkout and place your order."
        >
            <CheckoutForm />
        </ProtectedRoute>
    );
}