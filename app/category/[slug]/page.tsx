import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";
import videoUrls from "@/data/videoUrls.json";
import Link from "next/link";
import { notFound } from "next/navigation";

// Helper to format camelCase to Title Case
const formatTitle = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

type VideoUrlsType = typeof videoUrls;
type CategoryKey = keyof VideoUrlsType;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Check if category exists
  if (!(slug in videoUrls)) {
    notFound();
  }

  const categoryKey = slug as CategoryKey;
  const videos = Object.entries(videoUrls[categoryKey]);
  const categoryTitle = formatTitle(slug);

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-background">
      <main className="flex min-h-screen w-full max-w-screen-xl flex-col py-5 px-16 bg-background">
        <Header showBackLink />
        
        {/* Category Videos Section */}
        <section className="w-full mt-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">{categoryTitle}</h2>
          <p className="text-gray-400 mb-8">{videos.length} videos</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(([key, video]) => (
              <VideoCard 
                key={key} 
                url={video.url} 
                title={formatTitle(key)} 
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// Generate static params for all categories
export function generateStaticParams() {
  return Object.keys(videoUrls).map((slug) => ({
    slug,
  }));
}
