import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";
import videoUrls from "@/data/videoUrls.json";

// Helper to format camelCase to Title Case
const formatTitle = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export default function Home() {
  const vibesAreHighVideos = Object.entries(videoUrls.vibesAreHigh);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-screen-xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Header />
        
        {/* Vibes Are High Section */}
        <section className="w-full mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Vibes Are High</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vibesAreHighVideos.map(([key, video]) => (
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
