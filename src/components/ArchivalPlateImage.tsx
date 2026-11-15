import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface ArchivalPlateImageProps {
  src: string;
  alt: string;
  accessionCode: string;
  title: string;
  className?: string;
}

export function ArchivalPlateImage({
  src,
  alt,
  accessionCode,
  title,
  className = 'w-full h-full object-cover',
}: ArchivalPlateImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center bg-[#e7e2da] dark:bg-[#1a1a1a] text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">
        <BookOpen className="w-7 h-7 mb-3 opacity-70" strokeWidth={1.4} />
        <span className="font-mono text-xs tracking-wider uppercase mb-1">{accessionCode}</span>
        <span className="font-serif text-base italic max-w-xs">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
