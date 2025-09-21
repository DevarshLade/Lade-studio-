// Test page to verify Clerk-Supabase integration
'use client';

import { useUser } from '@/hooks/useUser';
import UserOrders from '@/components/user/UserOrders';
import UserReviews from '@/components/user/UserReviews';

export default function TestUserIntegration() {
  const { user, supabaseUser, isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">User Integration Test</h1>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Integration Test</h1>
      
      {isAuthenticated ? (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Clerk User Data</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold">Supabase User Data</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(supabaseUser, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <UserOrders />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <UserReviews />
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            Please sign in to test the Clerk-Supabase integration.
          </p>
        </div>
      )}
    </div>
  );
}