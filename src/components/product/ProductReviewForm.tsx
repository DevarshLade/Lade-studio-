// Component to allow users to write reviews for products
'use client';

import { useState, memo, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { createReview } from '@/lib/services/userService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ProductReviewFormProps {
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
}

const ProductReviewForm = memo(({ 
  productId, 
  productName,
  onReviewSubmitted 
}: ProductReviewFormProps) => {
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useUser();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to write a review.",
        variant: "destructive"
      });
      return;
    }

    if (comment.trim() === '') {
      toast({
        title: "Review Required",
        description: "Please write a review comment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const result = await createReview(
        user.id,
        productId,
        rating,
        comment.trim()
      );
      
      if (result.success) {
        toast({
          title: "Review Submitted!",
          description: "Thank you for your feedback.",
        });
        setRating(5);
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to submit review",
          variant: "destructive"
        });
        console.error('Error submitting review:', result.error);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while submitting the review",
        variant: "destructive"
      });
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [isAuthenticated, user?.id, productId, rating, comment, onReviewSubmitted, toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show authentication prompt
  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Write a Review</h3>
        <p className="text-yellow-800 mb-4">
          Please sign in to write a review for {productName}.
        </p>
        <Button asChild>
          <Link href="/auth">Sign In to Review</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Rating</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none"
              >
                <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
            <span className="ml-2 text-gray-600">{rating} Star{rating !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div>
          <label htmlFor="comment" className="block mb-2 font-medium">
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-3 min-h-[120px]"
            placeholder="Share your thoughts about this product..."
            disabled={submitting}
          />
        </div>
        
        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
});
ProductReviewForm.displayName = 'ProductReviewForm';

export default ProductReviewForm;