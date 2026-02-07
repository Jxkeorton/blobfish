'use client';

import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  slug: string;
  title: string;
  thumbnailUrl: string;
  videoCount: number;
}

export const CategoryCard = ({ slug, title, thumbnailUrl, videoCount }: CategoryCardProps) => {
  return (
    <Link 
      href={`/category/${slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
    >
      {/* Thumbnail Container */}
      <div className="aspect-video w-full overflow-hidden relative bg-gray-800">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Folder Icon */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
          <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-foreground text-sm font-medium font-system-sans">{videoCount} videos</span>
        </div>
      </div>
      
      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-5 font-bold font-system-sans">
        <h3 className="text-xl text-foreground">{title}</h3>
      </div>
      
      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-500/60 transition-colors duration-300 pointer-events-none" />
    </Link>
  )
}
