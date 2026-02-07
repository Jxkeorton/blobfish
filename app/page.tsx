import { CategoryCard } from "@/components/CategoryCard";
import fs from 'fs';
import path from 'path';

interface VideoEntry {
  category: string;
  title: string;
  url: string;
}

// Parse CSV file
function parseCSV(csvContent: string): VideoEntry[] {
  const lines = csvContent.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const values = line.trim().split(',');
    return {
      category: values[0],
      title: values[1],
      url: values[2],
    };
  });
}

// Group videos by category
function groupByCategory(videos: VideoEntry[]): Map<string, VideoEntry[]> {
  const grouped = new Map<string, VideoEntry[]>();
  
  for (const video of videos) {
    const existing = grouped.get(video.category) || [];
    existing.push(video);
    grouped.set(video.category, existing);
  }
  
  return grouped;
}

// Extract YouTube video ID from URL
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function Home() {
  const csvPath = path.join(process.cwd(), 'data', 'videoUrls.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const videos = parseCSV(csvContent);
  const categoriesMap = groupByCategory(videos);

  return (
    <>      
      {/* Categories Section */}
      <section className="w-full mt-5">
          <h2 className="text-2xl text-foreground mb-6">Video Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(categoriesMap.entries()).map(([category, categoryVideos]) => {
              const firstVideoUrl = categoryVideos[0]?.url || '';
              const videoId = getYouTubeId(firstVideoUrl);
              const thumbnailUrl = videoId 
                ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                : '/placeholder.jpg';
              
              return (
                <CategoryCard 
                  key={category}
                  slug={encodeURIComponent(category)}
                  title={category}
                  thumbnailUrl={thumbnailUrl}
                  videoCount={categoryVideos.length}
                />
              );
            })}
          </div>
        </section>
    </>
  );
}
