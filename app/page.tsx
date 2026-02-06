import { CategoryCard } from "@/components/CategoryCard";
import videoUrls from "@/data/videoUrls.json";

// Helper to format camelCase to Title Case
export const formatTitle = (key: string) => {
  return key
    .replace(/-/g, ' | ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

// Extract YouTube video ID from URL
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function Home() {
  const categories = Object.entries(videoUrls) as [string, Record<string, { url: string }>][];

  return (
    <>      
      {/* Categories Section */}
      <section className="w-full mt-5">
          <h2 className="text-2xl text-foreground mb-6">Video Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(([slug, videos]) => {
              const videoEntries = Object.values(videos);
              const firstVideoUrl = videoEntries[0]?.url || '';
              const videoId = getYouTubeId(firstVideoUrl);
              const thumbnailUrl = videoId 
                ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                : '/placeholder.jpg';
              
              return (
                <CategoryCard 
                  key={slug}
                  slug={slug}
                  title={formatTitle(slug)}
                  thumbnailUrl={thumbnailUrl}
                  videoCount={videoEntries.length}
                />
              );
            })}
          </div>
        </section>
    </>
  );
}
