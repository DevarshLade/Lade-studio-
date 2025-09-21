import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { syncUserToSupabase, handleUserDeleted } from '@/lib/services/webhookService'
import { handleCorsPreflight, withCorsHeaders } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS() {
  return withCorsHeaders(new Response(null, { status: 204 }))
}

export async function POST(req: Request) {
  // Handle CORS preflight
  const corsPreflight = handleCorsPreflight(req as any)
  if (corsPreflight) return corsPreflight

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data
  const eventType = evt.type

  // Handle different event types
  switch (eventType) {
    case 'user.created':
      await syncUserToSupabase(evt.data)
      break
    case 'user.updated':
      await syncUserToSupabase(evt.data)
      break
    case 'user.deleted':
      if (id) {
        await handleUserDeleted(id)
      }
      break
    default:
      console.log(`Unhandled event type: ${eventType}`)
  }

  // Return a response with CORS headers
  return withCorsHeaders(new Response('Webhook received', { status: 200 }))
}