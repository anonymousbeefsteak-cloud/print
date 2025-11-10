import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CarouselProps {
  slides: string[];
  autoSlideInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ slides, autoSlideInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const nextSlide = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (autoSlideInterval) {
      const slideInterval = setInterval(nextSlide, autoSlideInterval);
      return () => clearInterval(slideInterval);
    }
  }, [nextSlide, autoSlideInterval]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg group mb-12">
      <div
        style={{ backgroundImage: `url(${slides[currentIndex]})` }}
        className="w-full h-full bg-center bg-cover duration-500"
      ></div>
      {/* Left Arrow */}
      <button 
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="hidden group-hover:block absolute top-1/2 left-5 transform -translate-y-1/2 text-2xl rounded-full p-2 bg-black/30 text-white cursor-pointer hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
      >
        <ChevronLeftIcon className="h-8 w-8" />
      </button>
      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="hidden group-hover:block absolute top-1/2 right-5 transform -translate-y-1/2 text-2xl rounded-full p-2 bg-black/30 text-white cursor-pointer hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
      >
        <ChevronRightIcon className="h-8 w-8" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center space-x-2">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            aria-label={`Go to slide ${slideIndex + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === slideIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
