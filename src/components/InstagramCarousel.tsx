import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface InstagramCarouselProps {
  children: React.ReactNode
}

export function InstagramCarousel({ children }: InstagramCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    // Set total snap points and current active snap point
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  return (
    <Carousel
      setApi={setApi}
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      {/* Content wrapper with Embla viewport */}
      <CarouselContent className="-ml-4">
        {React.Children.map(children, (child, index) => (
          <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <div className="h-full py-1">
              {child}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Navigation Controls (Desktop) */}
      <div className="hidden md:flex justify-between items-center mt-10">
        <div className="flex items-center gap-4 mx-auto">
          <CarouselPrevious 
            className="static translate-y-0 text-[#1C1917] border-[#78716C]/20 hover:bg-[#1C1917]/5 active:scale-95 transition-all duration-200 cursor-pointer" 
          />
          
          {/* Navigation Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  current === index 
                    ? "w-8 bg-[#7C0A12]" 
                    : "w-1.5 bg-[#78716C]/30 hover:bg-[#78716C]/60"
                )}
                aria-label={`Ir a diapositiva ${index + 1}`}
              />
            ))}
          </div>

          <CarouselNext 
            className="static translate-y-0 text-[#1C1917] border-[#78716C]/20 hover:bg-[#1C1917]/5 active:scale-95 transition-all duration-200 cursor-pointer" 
          />
        </div>
      </div>

      {/* Navigation Dots (Mobile) */}
      <div className="flex md:hidden justify-center gap-1.5 mt-8">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              current === index 
                ? "w-6 bg-[#7C0A12]" 
                : "w-1 bg-[#78716C]/30"
            )}
            aria-label={`Ir a diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </Carousel>
  )
}
