// Component to display and manage user reviews
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { getUserReviews, createReview, updateReview, deleteReview } from '@/lib/services/userService';

interface Review {
  id: string;
  created_at: string;
  updated_at: string;
  rating: number;
  comment: string;
  product_id: string;
  products: {
    name: string;
    image_url: string;
  } | null;
}

export default function UserReviews() {
  const { user, isAuthenticated, loading: authLoading } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ rating: number; comment: string }>({ rating: 5, comment: '' });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await getUserReviews(user.id);
        
        if (result.success) {
          setReviews(result.data || []);
        } else {
          setError('Failed to fetch reviews');
          console.error('Error fetching reviews:', result.error);
        }
      } catch (err) {
        setError('An error occurred while fetching reviews');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isAuthenticated, user?.id]);

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditData({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleSaveReview = async () => {
    if (!editingReviewId || !user?.id) return;

    try {
      const result = await updateReview(
        editingReviewId,
        user.id,
        editData.rating,
        editData.comment
      );

      if (result.success) {
        // Update the review in the local state
        setReviews(reviews.map(review => 
          review.id === editingReviewId 
            ? { ...review, ...result.data } 
            : review
        ));
        setEditingReviewId(null);
      } else {
        setError('Failed to update review');
        console.error('Error updating review:', result.error);
      }
    } catch (err) {
      setError('An error occurred while updating the review');
      console.error('Error:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user?.id) return;

    try {
      const result = await deleteReview(reviewId, user.id);
      
      if (result.success) {
        // Remove the review from the local state
        setReviews(reviews.filter(review => review.id !== reviewId));
      } else {
        setError('Failed to delete review');
        console.error('Error deleting review:', result.error);
      }
    } catch (err) {
      setError('An error occurred while deleting the review');
      console.error('Error:', err);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (authLoading || loading) {
    return <div>Loading reviews...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in to view your reviews.</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (reviews.length === 0) {
    return <div>You haven't written any reviews yet.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          {editingReviewId === review.id ? (
            // Edit mode
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {review.products?.image_url ? (
                  <img 
                    src={review.products.image_url} 
                    alt={review.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{review.products?.name || 'Product'}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <label>Rating:</label>
                    <select
                      value={editData.rating}
                      onChange={(e) => setEditData({...editData, rating: parseInt(e.target.value)})}
                      className="border rounded px-2 py-1"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-2">Comment:</label>
                <textarea
                  value={editData.comment}
                  onChange={(e) => setEditData({...editData, comment: e.target.value})}
                  className="w-full border rounded p-2"
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveReview}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingReviewId(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {review.products?.image_url ? (
                  <img 
                    src={review.products.image_url} 
                    alt={review.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{review.products?.name || 'Product'}</p>
                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700">{review.comment}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditReview(review)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}