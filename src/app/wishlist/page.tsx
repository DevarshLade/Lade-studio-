"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import type { Wishlist } from "@/types/database"
import type { Product } from "@/types"
import { useUser } from "@clerk/nextjs"
import { getUserWishlist, removeFromWishlist } from "@/lib/api/wishlist"

type WishlistWithProduct = Wishlist & { products: Product }

function EmptyWishlist() {
    return (
        <div className="text-center p-12">
            <div className="bg-primary/10 text-primary p-6 rounded-full mb-6 inline-block">
                <Heart className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-headline mb-4">Your Wishlist is Empty</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Save your favorite products to your wishlist so you can easily find them later.
            </p>
            <Button asChild size="lg">
                <Link href="/products">Discover Products</Link>
            </Button>
        </div>
    )
}

function WishlistItem({ item, onRemove, onAddToCart }: {
    item: WishlistWithProduct
    onRemove: (productId: string) => Promise<void>
    onAddToCart: (product: Product) => void
}) {
    const [isRemoving, setIsRemoving] = useState(false)
    const product = item.products

    const handleRemove = async () => {
        setIsRemoving(true)
        await onRemove(product.id)
        setIsRemoving(false)
    }

    const handleAddToCart = () => {
        onAddToCart(product)
    }

    // Handle image loading errors
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'
    }

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
                    <Image
                       src={item.images[0]}
                       alt={item.name}
                       width={120}
                       height={120}
                       className="rounded-md object-cover"
                       data-ai-hint={item.aiHint}
                       loading="lazy"
                       quality={80}
                     />
                </div>
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-headline text-lg font-semibold">
                                <Link 
                                    href={`/product/${product.slug || product.id}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {product.name || 'Unnamed Product'}
                                </Link>
                            </h3>
                            {product.category && (
                                <p className="text-sm text-muted-foreground capitalize">
                                    {product.category.toLowerCase()}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="text-muted-foreground hover:text-red-500"
                            title="Remove from wishlist"
                        >
                            {isRemoving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-lg">₹{(product.price || 0).toLocaleString()}</span>
                        {product.originalPrice && product.originalPrice > (product.price || 0) && (
                            <span className="text-muted-foreground line-through">
                                ₹{product.originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            onClick={handleAddToCart}
                            size="sm"
                            className="flex-1"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <Link href={`/product/${product.slug || product.id}`}>
                                View Details
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function WishlistContent() {
    const { user } = useUser()
    const { addToCart } = useCart()
    const { toast } = useToast()
    const [wishlistItems, setWishlistItems] = useState<WishlistWithProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchWishlist = async () => {
        if (!user) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            const { data, error: apiError } = await getUserWishlist(user.id)
            if (apiError) {
                throw new Error(apiError.message)
            }
            
            setWishlistItems(data || [])
        } catch (err) {
            console.error("Error fetching wishlist:", err)
            setError(err instanceof Error ? err.message : 'Failed to load wishlist')
            toast({
                title: "Error",
                description: "Failed to load your wishlist. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [user])

    const handleRemoveItem = async (productId: string) => {
        if (!user) return
        
        try {
            const { error } = await removeFromWishlist(user.id, productId)
            if (error) {
                throw new Error(error.message)
            }

            setWishlistItems(prev => prev.filter(item => item.product_id !== productId))
            
            toast({
                title: "Removed from Wishlist",
                description: "The item has been removed from your wishlist.",
            })
        } catch (error) {
            console.error("Error removing item:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to remove item",
                variant: "destructive"
            })
        }
    }

    const handleAddToCart = (product: Product) => {
        try {
            addToCart(product, 1)
            toast({
                title: "Added to Cart",
                description: `${product.name || 'Product'} has been added to your cart.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add item to cart. Please try again.",
                variant: "destructive"
            })
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center p-8">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4 inline-block">
                        <Heart className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-red-600 mb-4">Error loading wishlist: {error}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={fetchWishlist}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/products">Browse Products</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl font-headline">My Wishlist</h1>
                    {wishlistItems.length > 0 && (
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {wishlistItems.length === 0 ? (
                    <EmptyWishlist />
                ) : (
                    <div className="space-y-4">
                        {wishlistItems.map((item) => (
                            <WishlistItem
                                key={item.id}
                                item={item}
                                onRemove={handleRemoveItem}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  )
}