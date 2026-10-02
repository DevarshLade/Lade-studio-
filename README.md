# KalaKriti Online — Handcrafted E-Commerce Studio

An e-commerce storefront for handcrafted artworks and artisan products. Product showcase with image galleries, shopping cart, streamlined checkout with Razorpay/Stripe payment integration, wishlist, and an AI-powered artwork suggestion engine.

## Features

- **Product showcase** — listings with high-quality images, names, categories, and prices
- **Product detail pages** — image galleries, descriptions, and specifications
- **Shopping cart & checkout** — streamlined cart flow with secure payment via Razorpay and Stripe
- **Wishlist** — save favorite items with a user account
- **AI Artwork Suggestor** — Genkit-powered recommendations for similar artworks based on viewing and purchase history
- **Responsive design** — soft terracotta (#A87C7C) / off-white (#FFF8F3) palette, Playfair headings, Lato body
- **Supabase backend** — product catalog, orders, and webhook-synced data
- **Clerk authentication** — sign-in with webhook sync to Supabase

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Clerk for auth, Supabase for database/storage
- Genkit + Google AI for artwork suggestions
- Razorpay + Stripe for payments

## Quick start

```bash
npm install
# fill in Clerk, Supabase, Razorpay/Stripe keys in .env.local
npm run dev
```

Open http://localhost:9002 in your browser.

## Project structure

```
src/
  app/            # Next.js App Router pages + API routes (webhooks, debug, health)
  components/     # UI components (shadcn/ui + custom)
  ai/flows/       # Genkit flows (artwork suggestions)
  lib/            # Supabase client, helpers
  context/ hooks/ # shared state and hooks
  middleware.ts   # Clerk auth middleware
supabase/         # schema/migrations
scripts/          # database seeding + fix utilities
docs/blueprint.md # design brief
```

## Environment variables

Requires Clerk publishable/secret keys, Supabase URL + anon key, Razorpay/Stripe keys, and a Google AI API key for the suggestion flow. See `src/app/api/env-check/route.ts` for the expected list.

## Deploy notes

Full-stack app — needs server routes (API/webhooks) and env secrets, so static export is not possible. Deploy to Vercel (`vercel.json` included) or Netlify; set all env vars on the platform before going live.

---

Built by Girish Lade — https://ladestack.in
