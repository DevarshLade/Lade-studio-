import { NextRequest } from 'next/server';
import { handleOrderCreated, handlePaymentCompleted } from '@/lib/services/webhookService';

// This webhook endpoint will handle Supabase events
export async function POST(request: NextRequest) {
  try {
    // Verify the webhook signature (you should implement proper verification)
    const signature = request.headers.get('Authorization');
    // In production, verify the signature with your webhook secret
    
    const payload = await request.json();
    
    // Handle different types of events
    switch (payload.type) {
      case 'ORDER_CREATED':
        await handleOrderCreated(payload.record);
        break;
      case 'PAYMENT_COMPLETED':
        await handlePaymentCompleted(payload.record);
        break;
      default:
        console.log('Unhandled event type:', payload.type);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
