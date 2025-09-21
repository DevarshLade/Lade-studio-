import type { Product, Category, Testimonial, BlogPost } from "@/types";

export const categories: Category[] = [
  { name: 'Painting', image: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwYWludGluZ3xlbnwwfHx8fDE3NTU2MjA5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080', hint: 'abstract painting' },
  { name: 'Pots', image: 'https://images.unsplash.com/photo-1536266305399-b367feb671f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxQb3RzfGVufDB8fHx8MTc1NTYyMTAwMHww&ixlib=rb-4.1.0&q=80&w=1080', hint: 'painted pot' },
  { name: 'Canvas', image: 'https://images.unsplash.com/photo-1577720643272-265f09367456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxDYW52YXMlMjBwYWludGluZ3xlbnwwfHx8fDE3NTU2MjEwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080', hint: 'artist canvas' },
  { name: 'Hand Painted Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxqZXdlbHJ5fGVufDB8fHx8MTc1NTYyMTAwMHww&ixlib=rb-4.1.0&q=80&w=1080', hint: 'terracotta necklace' },
  { name: 'Terracotta Pots', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx0ZXJyYWNvdHRhfGVufDB8fHx8MTc1NTYyMTAwMHww&ixlib=rb-4.1.0&q=80&w=1080', hint: 'terracotta pot' },
  { name: 'Fabric Painting', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxmYWJyaWN8ZW58MHx8fHwxNzU1NjIxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080', hint: 'painted fabric' },
  { name: 'Portrait', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwb3J0cmFpdHxlbnwwfHx8fDE3NTU2MjEwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080', hint: 'portrait painting' },
  { name: 'Wall Hanging', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8d2FsbCBhcnR8ZW58MHx8fHwxNzU1NjIxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080', hint: 'wall hanging' },
];

export const products: Product[] = [
  // Products are now loaded from Supabase database
  // Use the admin panel or database to add real products
];

export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Priya Sharma',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdHxlbnwwfHx8fDE3NTU2MjEwMDB8MA&ixlib=rb-4.1.0&q=80&w=100',
    quote: 'The painting I bought is the centerpiece of my living room! The quality and detail are simply breathtaking. It feels like a piece of my soul on the wall.'
  },
  {
    id: 'test-2',
    name: 'Arjun Verma',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdHxlbnwwfHx8fDE3NTU2MjEwMDB8MA&ixlib=rb-4.1.0&q=80&w=100',
    quote: 'I gifted my wife the terracotta necklace and she absolutely adores it. It\'s so unique and beautifully crafted. Fast shipping and lovely packaging too!'
  },
  {
    id: 'test-3',
    name: 'Anika Reddy',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdHxlbnwwfHx8fDE3NTU2MjEwMDB8MA&ixlib=rb-4.1.0&q=80&w=100',
    quote: 'My hand-painted pot brings so much joy to my workspace. It’s a daily reminder of the beauty of handmade art. I can’t wait to buy more!'
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Story Behind My Latest Collection',
    image: 'https://images.unsplash.com/photo-1621735320171-a682f45d7172?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxUaGUlMjBTdG9yeSUyMEJlaGluZCUyME15JTIwTGF0ZXN0JTIwQ29sbGVjdGlvbnxlbnwwfHx8fDE3NTU2MjIyOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    excerpt: 'Dive deep into the inspiration and process that brought the "Forest Whispers" collection to life. From initial sketches to the final brushstroke.',
    hint: 'art studio'
  },
  {
    id: 'blog-2',
    title: '5 Ways to Style Your Home with Art',
    image: 'https://images.unsplash.com/photo-1656275537619-43565fdd6655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHw1JTIwV2F5cyUyMHRvJTIwU3R5bGUlMjBZb3VyJTIwSG9tZSUyMHdpdGglMjBBcnR8ZW58MHx8fHwxNzU1NjIyMTgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    excerpt: 'Art isn\'t just for galleries. Discover creative and simple ways to integrate handmade art into your home decor for a personal touch.',
    hint: 'interior design'
  },
  {
    id: 'blog-3',
    title: 'A Glimpse into Terracotta Crafting',
    image: 'https://images.unsplash.com/photo-1664787294667-b64f325a751a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxBJTIwR2xpbXBzZSUyMGludG8lMjBUZXJyYWNvdHRhJTIwQ3JhZnRpbmd8ZW58MHx8fHwxNzU1NjIyMTYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    excerpt: 'From a simple block of clay to a beautiful piece of jewelry. Join me in the studio for a visual journey of how my terracotta pieces are made.',
    hint: 'pottery making'
  },
];
