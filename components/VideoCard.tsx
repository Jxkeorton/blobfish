'use client';

import Image from "next/image";

interface VideoCardProps {
  url: string;
  title?: string;
}

// Extract YouTube video ID from URL
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const VideoCard = ({ url, title }: VideoCardProps) => {
  const videoId = getYouTubeId(url);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : '/placeholder.jpg';

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
    >
      {/* Thumbnail Container */}
      <div className="aspect-video w-full overflow-hidden relative bg-gray-800">
        <Image
          src={thumbnailUrl}
          alt={title || 'Video thumbnail'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 group-hover:bg-black/30">
          <div className="w-16 h-16 bg-[#F15A58] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
            <svg className="w-8 h-8 text-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Title Overlay */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pt-8 font-system-sans font-bold">
          <h3 className="text-lg text-foreground truncate">{title}</h3>
        </div>
      )}
      
      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-600/60 transition-colors duration-300 pointer-events-none" />
    </a>
  )
}