import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "dots" | "spinner" | "pulse" | "skeleton";
  className?: string;
}

export const Loading = ({ size = "md", variant = "dots", className }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <div className={cn("bg-primary rounded-full animate-loading-dots", sizeClasses[size])} />
        <div className={cn("bg-primary rounded-full animate-loading-dots", sizeClasses[size])} style={{ animationDelay: "0.2s" }} />
        <div className={cn("bg-primary rounded-full animate-loading-dots", sizeClasses[size])} style={{ animationDelay: "0.4s" }} />
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className={cn("animate-spin-slow border-2 border-primary border-t-transparent rounded-full", sizeClasses[size], className)} />
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("bg-primary rounded-full loading-pulse", sizeClasses[size], className)} />
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("loading-skeleton rounded", sizeClasses[size], className)} />
    );
  }

  return null;
};

// Progress bar component
interface ProgressBarProps {
  progress: number;
  className?: string;
  animated?: boolean;
}

export const ProgressBar = ({ progress, className, animated = true }: ProgressBarProps) => {
  return (
    <div className={cn("w-full bg-secondary rounded-full h-2", className)}>
      <div 
        className={cn(
          "bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500",
          animated && "animate-progress"
        )}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
};

// Skeleton loader for text and cards
interface SkeletonProps {
  lines?: number;
  className?: string;
  variant?: "text" | "card" | "circle" | "image";
}

export const Skeleton = ({ lines = 3, className, variant = "text" }: SkeletonProps) => {
  if (variant === "circle") {
    return <div className={cn("loading-skeleton rounded-full w-12 h-12", className)} />;
  }

  if (variant === "card") {
    return (
      <div className={cn("loading-skeleton rounded-lg p-4 space-y-2", className)}>
        <div className="loading-skeleton h-4 rounded w-3/4" />
        <div className="loading-skeleton h-4 rounded w-1/2" />
        <div className="loading-skeleton h-20 rounded w-full" />
      </div>
    );
  }

  if (variant === "image") {
    return <div className={cn("loading-skeleton rounded-lg w-full h-48", className)} />;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="loading-skeleton h-4 rounded"
          style={{ 
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};
