import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/data";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-headline text-center mb-12">From the Studio</h1>
      <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
        Insights into our creative process, styling tips, and the stories behind our favorite pieces.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <Link href={`/blog/${post.id}`}>
              <Image
                src={post.image}
                alt={post.title}
                width={400}
                height={250}
                className="w-full h-64 object-cover rounded-t-lg"
                data-ai-hint={post.hint}
                loading="lazy"
                quality={80}
              />
            </Link>
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                 <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href={`/blog/${post.id}`}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
