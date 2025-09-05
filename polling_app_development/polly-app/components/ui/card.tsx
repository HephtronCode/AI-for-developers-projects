import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: "none" | "fade-in" | "scale-in" | "slide-in-right" | "slide-in-left";
  hoverEffect?: "none" | "scale" | "glow" | "border-glow";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animation = "none", hoverEffect = "none", ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border border-glass-border bg-card/80 backdrop-blur-sm text-card-foreground shadow-md transition-all duration-300 ${
        animation === "none"
          ? ""
          : animation === "fade-in"
          ? "animate-fade-in"
          : animation === "scale-in"
          ? "animate-scale-in"
          : animation === "slide-in-right"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      } ${
        hoverEffect === "none"
          ? "hover:shadow-lg"
          : hoverEffect === "scale"
          ? "hover:shadow-lg hover:scale-[1.02]"
          : hoverEffect === "glow"
          ? "hover:shadow-lg hover:shadow-primary/20"
          : "hover:shadow-lg hover:border-primary/30"
      } ${className}`}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};