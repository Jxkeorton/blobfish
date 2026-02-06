"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  const showBackLink = pathname !== "/";

  return (
    <header className="top-0 left-0 z-50 bg-background shadow-sm">
      <div className="mx-auto px-4 py-2 flex items-center justify-between">
        {/* Back Link - Mobile: Icon only, Desktop: Icon + Text */}
        {showBackLink && (
          <Link 
            href="/"
            className="inline-flex items-center gap-2 transition-colors"
            style={{ color: '#F0B8CD' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
        )}
        
        {/* Logo - Centered when no back link */}
        <div className={`flex items-center ${!showBackLink ? 'mx-auto' : ''}`}>
          <Image
            src="/BlobfishPink.png"
            alt="Blobfish logo"
            width={150}
            height={150}
          />
        </div>
        
        {/* Spacer for layout balance when back link is present */}
        {showBackLink && <div className="w-5"></div>}
      </div>
    </header>
  )
}