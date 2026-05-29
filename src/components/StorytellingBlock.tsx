import * as React from "react"
import { ArrowRight } from "@phosphor-icons/react"

interface Storytelling {
  title: string;
  description: string;
  linkText: string;
}

interface StorytellingBlockProps {
  placeholderImage: string;
  storytelling: Storytelling;
}

const StorytellingBlock = React.memo(function StorytellingBlock({
  placeholderImage,
  storytelling
}: StorytellingBlockProps) {
  return (
    <div className="w-full bg-[#7C0A12] text-white py-16 md:py-24 px-8 md:px-16 mb-4 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border border-[#7C0A12]">
      {/* Overlay with blurred placeholder image for editorial texture */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
        <img 
          src={placeholderImage} 
          alt="Textura de piedras" 
          className="w-full h-full object-cover filter blur-[2px]"
          loading="lazy"
        />
      </div>
      <div className="w-full md:w-3/5 relative z-10 flex flex-col items-start gap-4">
        <h2 className="font-heading text-3xl md:text-5xl mb-2 text-white leading-tight">
          {storytelling.title}
        </h2>
        <div className="w-16 h-0.5 bg-white opacity-80 my-2"></div>
        <p className="text-base font-light max-w-xl opacity-90 leading-relaxed text-white/90">
          {storytelling.description}
        </p>
        <a 
          href="#" 
          className="inline-flex items-center gap-2 border-b border-white pb-1 font-semibold text-xs uppercase tracking-widest hover:text-white/80 hover:border-white/80 transition-colors duration-300 mt-4 text-white"
        >
          {storytelling.linkText} <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
});

export default StorytellingBlock;
