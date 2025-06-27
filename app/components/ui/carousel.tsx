"use client";
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

interface CarouselApi {
  scrollNext: () => void;
  scrollPrev: () => void;
  canScrollNext: () => boolean;
  canScrollPrev: () => boolean;
  scrollTo: (index: number) => void;
  selectedScrollSnap: () => number;
  scrollSnapList: () => number[];
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
}

interface CarouselContextProps {
  carouselRef?: UseEmblaCarouselType[0];
  api?: UseEmblaCarouselType[1];
  opts?: any;
  orientation: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  totalSlides: number;
  scrollTo: ((index: number) => void) | undefined;
}

const CarouselContext = React.createContext<CarouselContextProps>({
  selectedIndex: 0,
  totalSlides: 0,
  orientation: "horizontal",
  scrollPrev: () => {},
  scrollNext: () => {},
  canScrollPrev: false,
  canScrollNext: false,
  scrollTo: undefined
});

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  opts?: any;
  setApi?: React.Dispatch<React.SetStateAction<UseEmblaCarouselType[1]>>;
  plugins?: any[];
  autoPlayInterval?: number;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      autoPlayInterval = 5000, // Auto-scroll interval in ms
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
        loop: true, // Enables looping
        drag: true, // Enables dragging
        startIndex: 0,
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [totalSlides, setTotalSlides] = React.useState(0);

    const onSelect = React.useCallback(
      (api: UseEmblaCarouselType[1]) => {
        if (!api) {
          return;
        }

        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
        setSelectedIndex(api.selectedScrollSnap());
        setTotalSlides(api.scrollSnapList().length);
      },
      []
    );

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    // Auto-scroll logic
    React.useEffect(() => {
      if (!api) return;

      const autoPlay = setInterval(() => {
        api.scrollNext();
      }, autoPlayInterval);

      return () => clearInterval(autoPlay); // Cleanup on component unmount
    }, [api, autoPlayInterval]);

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    const handleSelect = React.useCallback((api: UseEmblaCarouselType[1]) => {
      if (!api) return;
      onSelect(api);
    }, [onSelect]);

    React.useEffect(() => {
      if (!api) return;

      handleSelect(api);
      api.on("reInit", handleSelect);
      api.on("select", handleSelect);

      return () => {
        api?.off("reInit", handleSelect);
        api?.off("select", handleSelect);
      };
    }, [api, handleSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          totalSlides,
          scrollTo: api?.scrollTo,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="w-full overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

export interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselPreviousProps>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute  h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  }
);
CarouselPrevious.displayName = "CarouselPrevious";

export interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  }
);
CarouselNext.displayName = "CarouselNext";

export interface CarouselPaginationProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselPagination = React.forwardRef<HTMLDivElement, CarouselPaginationProps>((props, ref) => {
  const { selectedIndex, totalSlides, scrollTo } = useCarousel();
  return (
    <div ref={ref} className="mt-4 flex justify-center" {...props}>
      <div className="flex space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={cn(
              'p-1 cursor-pointer transition-all duration-200',
              'flex items-center justify-center' // Ensure content is centered
            )}
            onClick={() => scrollTo!(index)}
            aria-label={`Navigate to slide ${index + 1}`}
          >
            <span 
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                'hover:scale-125 hover:opacity-80', // Add hover effect
                index === selectedIndex 
                  ? 'bg-[#7dfdfe] shadow-sm shadow-[#7dfdfe]/50' // Add shadow effect for selected state
                  : 'bg-gray-500/50 hover:bg-gray-400/70' // Hover effect for non-selected state
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
});
CarouselPagination.displayName = "CarouselPagination";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselPagination,
};