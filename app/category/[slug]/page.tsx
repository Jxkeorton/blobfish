import { VideoCard } from "@/components/VideoCard";
import { notFound } from "next/navigation";
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

// Get all videos from CSV
function getVideos(): VideoEntry[] {
  const csvPath = path.join(process.cwd(), 'data', 'videoUrls.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  return parseCSV(csvContent);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);
  const allVideos = getVideos();
  
  // Filter videos for this category
  const categoryVideos = allVideos.filter(video => video.category === categoryName);
  
  // Check if category exists
  if (categoryVideos.length === 0) {
    notFound();
  }

  return (
    <>        
      {/* Category Videos Section */}
      <section className="w-full mt-8">
          <h2 className="text-3xl text-foreground mb-2">{categoryName}</h2>
          <p className="text-gray-400 mb-8">{categoryVideos.length} videos</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryVideos.map((video, index) => (
              <VideoCard 
                key={index} 
                url={video.url} 
                title={video.title} 
              />
            ))}
          </div>
        </section>
    </>
  );
}

// Generate static params for all categories
export function generateStaticParams() {
  const allVideos = getVideos();
  const categories = [...new Set(allVideos.map(v => v.category))];
  
  return categories.map((category) => ({
    slug: encodeURIComponent(category),
  }));
}
