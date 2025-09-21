import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Head from 'next/head';

export const metadata = {
  title: "About Lade Studio | Handmade Art & Craft Products",
  description: "Discover the story behind Lade Studio, a passionate independent artist creating unique handmade paintings, hand-painted pots, and terracotta jewelry. Learn about our journey and philosophy.",
  keywords: "Lade Studio, handmade art, hand-painted pots, terracotta jewelry, independent artist, artisan crafts, unique artwork, custom designs",
  openGraph: {
    title: "About Lade Studio - Handmade Art & Craft Products",
    description: "Discover the story behind Lade Studio, a passionate independent artist creating unique handmade paintings, hand-painted pots, and terracotta jewelry.",
    type: "website",
    locale: "en_US",
    url: "https://ladestudio.com/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Head>
        <meta name="description" content="Discover the story behind Lade Studio, a passionate independent artist creating unique handmade paintings, hand-painted pots, and terracotta jewelry. Learn about our journey and philosophy." />
        <meta name="keywords" content="Lade Studio, handmade art, hand-painted pots, terracotta jewelry, independent artist, artisan crafts, unique artwork, custom designs" />
        <link rel="canonical" href="https://ladestudio.com/about" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">About Lade Studio</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              A celebration of handmade artistry, where every creation has a soul and a story.
            </p>
          </section>

          {/* Studio Image */}
          <section className="mb-16">
            <Image
              src="/images/about-hero.jpg"
              alt="Art studio workspace"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              loading="lazy"
              quality={80}
            />
          </section>

          {/* Our Story */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-headline mb-6">Our Story</h2>
            <div className="text-lg text-foreground/80 space-y-6">
              <p>
                Lade Studio began not in a gallery, but in a small, sunlit corner of a humble apartment, fueled by a passion for creating and a deep appreciation for the imperfect beauty of handmade goods. It started with a single paintbrush, a lump of clay, and the simple idea that art should be accessible, personal, and part of our daily lives.
              </p>
              <p>
                Our founder, a self-taught artist, found solace and expression in transforming simple materials into objects of beauty. What began as a personal hobby soon blossomed into a calling. Friends and family admired the unique charm of the hand-painted pots, the intricate detail of the terracotta jewelry, and the vibrant energy of the paintings. Their encouragement sparked the idea for Lade Studio.
              </p>
              <p>
                Today, Lade Studio is a small, independent venture dedicated to bringing you authentic, handcrafted pieces. Each item is a labor of love, meticulously crafted and infused with a unique character that mass-produced items simply cannot replicate. We believe in the power of art to connect, inspire, and bring joy.
              </p>
            </div>
          </section>

          {/* Our Philosophy */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-headline mb-6">Our Philosophy</h2>
            <div className="text-lg text-foreground/80 space-y-6">
              <p>
                At Lade Studio, we cherish the slow, deliberate process of creating by hand. We embrace the slight variations and unique marks that make each piece one-of-a-kind. Our philosophy is rooted in three core principles:
              </p>
              <ul className="list-disc list-inside space-y-4 pl-4">
                <li>
                  <h3 className="font-bold text-xl">Authenticity</h3>
                  <p>Every product is a genuine expression of creativity, free from industrial uniformity.</p>
                </li>
                <li>
                  <h3 className="font-bold text-xl">Quality Craftsmanship</h3>
                  <p>We use high-quality materials and time-honored techniques to ensure our creations are not only beautiful but also durable.</p>
                </li>
                <li>
                  <h3 className="font-bold text-xl">Sustainable Practices</h3>
                  <p>We are mindful of our environmental impact, using eco-friendly materials and processes whenever possible.</p>
                </li>
              </ul>
              <p>
                Thank you for being part of our journey. When you bring a piece from Lade Studio into your life, you're not just buying an object; you're supporting an artist's dream and embracing a story of passion and creativity.
              </p>
            </div>
          </section>

          {/* Unique Value Proposition */}
          <section className="mb-16 bg-accent/20 p-8 rounded-lg">
            <h2 className="text-3xl md:text-4xl font-headline mb-6">Why Choose Lade Studio?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-3">Handcrafted with Love</h3>
                <p>Each piece is individually created by our artist, ensuring attention to detail and quality that machines cannot replicate.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Unique & One-of-a-Kind</h3>
                <p>No two pieces are exactly alike, giving you a truly unique art piece for your home or as a gift.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Sustainable Art</h3>
                <p>We prioritize eco-friendly materials and processes to minimize our environmental footprint.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Direct from Artist</h3>
                <p>Purchase directly from the creator, ensuring fair compensation and authentic storytelling.</p>
              </div>
            </div>
          </section>

          {/* Website Credit */}
          <section className="border-t pt-8 mt-8">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">
                This website is a digital canvas brought to life through the creative vision and technical expertise of <strong>Girish Lade</strong>.
              </p>
              <p>
                For web development inquiries, collaborations, or to explore how we can bring your digital presence to life, 
                connect with Girish at{' '}
                <a 
                  href="https://www.ladestack.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  www.ladestack.in
                </a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}