// Component to allow users to write reviews for products
'use client';

import { useState, memo, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { createReview } from '@/lib/services/userService';

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
  const { user, isAuthenticated } = useUser();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user?.id) {
      setError('Please sign in to write a review');
      return;
    }

    if (comment.trim() === '') {
      setError('Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      
      const result = await createReview(
        user.id,
        productId,
        rating,
        comment.trim()
      );
      
      if (result.success) {
        setSuccess(true);
        setRating(5);
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        setError('Failed to submit review');
        console.error('Error submitting review:', result.error);
      }
    } catch (err) {
      setError('An error occurred while submitting the review');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [isAuthenticated, user?.id, productId, rating, comment, onReviewSubmitted]);

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Please sign in to write a review for {productName}.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800">Thank you for your review!</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}
      
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
        
        <button
          type="submit"
          disabled={submitting}
          className={`px-6 py-3 rounded-lg font-medium ${
            submitting
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
});
ProductReviewForm.displayName = 'ProductReviewForm';

export default ProductReviewForm;