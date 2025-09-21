import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Feather, Instagram, Facebook } from "lucide-react";
import { memo } from "react";

const Logo = memo(() => (
  <Link href="/" className="flex items-center gap-2 mb-4">
    <Feather className="h-7 w-7 text-primary" />
    <span className="text-2xl font-headline font-bold">Lade Studio</span>
  </Link>
));
Logo.displayName = 'Logo';

const Footer = memo(() => {
  return (
    <footer className="bg-accent/50 text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and About */}
          <div>
            <Logo />
            <p className="text-sm text-muted-foreground">
              Handmade art with soul. Bringing authenticity and elegance to your space, one creation at a time.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-headline text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h3 className="font-headline text-lg mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h3 className="font-headline text-lg mb-4">Join Our Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Get updates on new arrivals and special offers.</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Your email" className="bg-background" />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Subscribe</Button>
            </form>
            <div className="flex gap-4 mt-6">
              <Link href="https://www.instagram.com/lade.artstudio?igsh=aWFyeWFrNGFpNGg0" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
              <Link href="https://www.facebook.com/share/1EoFAuqR7m/?mibextid=wwXIfr" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lade Studio. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
});
Footer.displayName = 'Footer';

export default Footer;