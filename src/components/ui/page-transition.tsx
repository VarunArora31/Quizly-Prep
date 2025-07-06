import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide-up" | "slide-left" | "scale" | "rotate";
  delay?: number;
}

export const PageTransition = ({ 
  children, 
  className, 
  variant = "fade", 
  delay = 0 
}: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    if (!isVisible) return "opacity-0";
    
    switch (variant) {
      case "fade":
        return "animate-fade-in-up";
      case "slide-up":
        return "animate-slide-up";
      case "slide-left":
        return "animate-slide-left";
      case "scale":
        return "animate-scale-in";
      case "rotate":
        return "animate-rotate-in";
      default:
        return "animate-fade-in-up";
    }
  };

  return (
    <div className={cn(getAnimationClass(), className)}>
      {children}
    </div>
  );
};

// Staggered children animation
interface StaggeredAnimationProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  variant?: "fade" | "slide-up" | "slide-left" | "scale";
}

export const StaggeredAnimation = ({ 
  children, 
  className,
  staggerDelay = 100,
  variant = "slide-up"
}: StaggeredAnimationProps) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <PageTransition
          key={index}
          variant={variant}
          delay={index * staggerDelay}
        >
          {child}
        </PageTransition>
      ))}
    </div>
  );
};

// Intersection Observer Animation
interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide-up" | "slide-left" | "scale";
  threshold?: number;
  rootMargin?: string;
}

export const ScrollAnimation = ({
  children,
  className,
  variant = "slide-up",
  threshold = 0.1,
  rootMargin = "0px"
}: ScrollAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, threshold, rootMargin]);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (variant) {
        case "slide-up":
          return "opacity-0 translate-y-8";
        case "slide-left":
          return "opacity-0 translate-x-8";
        case "scale":
          return "opacity-0 scale-95";
        case "fade":
        default:
          return "opacity-0";
      }
    }

    switch (variant) {
      case "slide-up":
        return "opacity-100 translate-y-0 transition-all duration-700 ease-out";
      case "slide-left":
        return "opacity-100 translate-x-0 transition-all duration-700 ease-out";
      case "scale":
        return "opacity-100 scale-100 transition-all duration-700 ease-out";
      case "fade":
      default:
        return "opacity-100 transition-opacity duration-700 ease-out";
    }
  };

  return (
    <div
      ref={setElementRef}
      className={cn(getAnimationClass(), className)}
    >
      {children}
    </div>
  );
};
