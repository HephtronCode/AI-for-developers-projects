import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "glow";
  size?: "default" | "sm" | "lg" | "icon";
  animation?: "none" | "pulse" | "scale" | "slide-in-right" | "slide-in-left";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", animation = "none", ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${
          variant === "default"
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20 hover:translate-y-[-2px]"
            : variant === "destructive"
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg hover:shadow-destructive/20 hover:translate-y-[-2px]"
            : variant === "outline"
            ? "border border-glass-border bg-background/50 backdrop-blur-sm hover:bg-accent/30 hover:border-primary/50 hover:text-primary hover:scale-[1.02]"
            : variant === "secondary"
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg hover:translate-y-[-2px]"
            : variant === "ghost"
            ? "hover:bg-accent/30 hover:text-primary hover:scale-[1.02]"
            : variant === "gradient"
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg hover:shadow-primary/20 hover:translate-y-[-2px] animate-gradient"
            : variant === "glow"
            ? "bg-background/50 border border-glass-border text-primary backdrop-blur-sm shadow-md hover:shadow-lg hover:shadow-primary/20 hover:translate-y-[-2px] animate-glow-pulse"
            : "underline-offset-4 hover:underline text-primary"
        } ${
          size === "default"
            ? "h-10 py-2 px-4"
            : size === "sm"
            ? "h-9 px-3 rounded-md"
            : size === "lg"
            ? "h-11 px-8 rounded-md"
            : "h-10 w-10"
        } ${
          animation === "none"
            ? ""
            : animation === "pulse"
            ? "animate-pulse"
            : animation === "scale"
            ? "animate-scale-in"
            : animation === "slide-in-right"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        } ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };