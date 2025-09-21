"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateProductReview } from "@/lib/api/reviews"
import { ImageUpload } from "./ImageUpload"
import type { Review } from "@/types"

type EditReviewDialogProps = {
  isOpen: boolean
  onClose: () => void
  review: Review
  onUpdated: (updatedReview: Review) => void
}

function StarRating({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            rating >= star ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary/70'
          }`}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  );
}

export function EditReviewDialog({ isOpen, onClose, review, onUpdated }: EditReviewDialogProps) {
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment || '')
  const [imageUrls, setImageUrls] = useState<string[]>(review.images || [])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating from 1 to 5 stars.",
        variant: "destructive"
      })
      return
    }
    
    // Validate comment length
    if (comment && comment.length > 1000) {
      toast({
        title: "Comment too long",
        description: "Please keep your comment under 1000 characters.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { data, error } = await updateProductReview(review.id, rating, comment, imageUrls)
      
      if (error) {
        throw error
      }

      toast({
        title: "Review Updated!",
        description: "Your review has been successfully updated.",
      })
      
      // Update the review in the parent component
      const updatedReview: Review = {
        ...review,
        rating,
        comment,
        images: imageUrls, // Add images to the review
        date: new Date().toISOString().split('T')[0] // Update date to current
      }
      onUpdated(updatedReview)
      onClose()
    } catch (error) {
      console.error("Review update error:", error)
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Failed to update review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      // Reset form to original values when closing
      setRating(review.rating)
      setComment(review.comment || '')
      setImageUrls(review.images || [])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Your Review</DialogTitle>
          <DialogDescription>
            Update your review and rating for this product.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Your Rating *</Label>
            <StarRating rating={rating} onRatingChange={setRating} />
            <p className="text-sm text-muted-foreground">
              {rating === 0 && "Select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-medium">
              Your Review
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your updated thoughts about this product..."
              rows={4}
              className="resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Optional</span>
              <span>{comment.length}/1000 characters</span>
            </div>
          </div>

          <ImageUpload
            onImagesChange={setImageUrls}
            existingImages={review.images || []}
            maxImages={5}
            disabled={isLoading}
          />

          <DialogFooter className="gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || rating === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}