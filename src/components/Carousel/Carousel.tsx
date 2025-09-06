import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Carousel.css";

// Import images properly
import Banner1 from "../../assets/Carousel/Banner1.gif";
import Banner2 from "../../assets/Carousel/Banner2.png";
import Banner3 from "../../assets/Carousel/Banner3.png";
import Banner4 from "../../assets/Carousel/Banner4.png";

type CarouselItem = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
};

const carouselItems: CarouselItem[] = [
  { 
    src: Banner1, 
    alt: "Banner 1",
    title: "Welcome to CodeSensei",
    description: "Master programming with our interactive platform"
  },
  { 
    src: Banner2, 
    alt: "Banner 2",
    title: "Learn & Practice",
    description: "Hands-on coding exercises and challenges"
  },
  { 
    src: Banner3, 
    alt: "Banner 3",
    title: "Expert Guidance",
    description: "Learn from AI in more practical ways"
  },
  { 
    src: Banner4, 
    alt: "Banner 4",
    title: "Build Projects",
    description: "Create real-world applications"
  },
];

const Carousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const goToSlide = (slideIndex: number) => {
    setDirection(slideIndex > index ? 1 : -1);
    setIndex(slideIndex);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto slide every 5 seconds when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    
    return () => clearInterval(timer);
  }, [isPlaying, index]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="carousel-container">
      {/* Progress bar */}
      <div className="carousel-progress">
        <motion.div 
          className="progress-bar"
          initial={{ width: "0%" }}
          animate={{ width: isPlaying ? "100%" : "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={index}
        />
      </div>

      {/* Main carousel content */}
      <div className="carousel-content">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 }
            }}
            className="carousel-slide"
          >
            <img
              src={carouselItems[index].src}
              alt={carouselItems[index].alt}
              className="carousel-image"
              onError={() => {
                console.error('Failed to load image:', carouselItems[index].src);
              }}
            />
            
            {/* Content overlay */}
            <div className="carousel-overlay">
              <motion.div 
                className="carousel-text"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {carouselItems[index].title && (
                  <h2 className="carousel-title">{carouselItems[index].title}</h2>
                )}
                {carouselItems[index].description && (
                  <p className="carousel-description">{carouselItems[index].description}</p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <button
        className="carousel-btn prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <button
        className="carousel-btn next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Play/Pause button */}
      <button
        className="carousel-btn play-pause"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
            <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polygon points="5,3 19,12 5,21" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Dots indicator */}
      <div className="carousel-dots">
        {carouselItems.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="carousel-counter">
        <span>{index + 1} / {carouselItems.length}</span>
      </div>
    </div>
  );
};

export default Carousel;
