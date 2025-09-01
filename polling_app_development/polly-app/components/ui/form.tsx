import * as React from "react";
import { cn } from "../../lib/utils";

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { error?: boolean; focused?: boolean }
>(({ className, error, focused, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "space-y-1.5 mb-4 relative", 
      "transition-all duration-200 ease-in-out",
      error && "animate-shake",
      focused && "ring-1 ring-primary/20 rounded-md p-2 -mx-2 bg-primary/5",
      className
    )} 
    {...props} 
  />
));
FormItem.displayName = "FormItem";

const FormRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "flex flex-wrap md:flex-nowrap gap-4 items-start",
      className
    )} 
    {...props} 
  />
));
FormRow.displayName = "FormRow";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      "transition-colors duration-200 mb-1.5 inline-block",
      "after:content-[''] after:block after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300",
      "group-focus-within:after:w-full group-focus-within:text-primary",
      "flex items-center gap-1",
      className
    )}
    {...props}
  >
    {props.children}
    {required && <span className="text-destructive">*</span>}
  </label>
));
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "mt-1.5 relative transition-all duration-200",
      "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1",
      "hover:border-primary/50",
      className
    )} 
    {...props} 
  />
));
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground mt-1.5",
      "animate-in fade-in slide-in-from-bottom-1 duration-300",
      "flex items-center gap-1.5",
      className
    )}
    {...props}
    aria-describedby={props.id}
  >
    {/* Optional info icon */}
    {props.children && (
      <>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/70"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>{props.children}</span>
      </>
    )}
  </p>
));
FormDescription.displayName = "FormDescription";

const FormHint = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xs text-muted-foreground italic mt-1",
      "transition-opacity duration-200 opacity-70 group-hover:opacity-100",
      className
    )}
    {...props}
  />
));
FormHint.displayName = "FormHint";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm font-medium text-destructive mt-1.5",
      "animate-in fade-in slide-in-from-bottom-1 duration-300",
      "flex items-center gap-1.5",
      className
    )}
    {...props}
    aria-live="assertive"
    role="alert"
  >
    {/* Optional error icon */}
    {children && (
      <>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-3.5 h-3.5 flex-shrink-0"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>{children}</span>
      </>
    )}
  </p>
));
FormMessage.displayName = "FormMessage";

const FormHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mb-6 pb-4 border-b",
      className
    )}
    {...props}
  />
));
FormHeader.displayName = "FormHeader";

const FormFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-6 pt-4 border-t flex flex-wrap justify-end gap-3",
      className
    )}
    {...props}
  />
));
FormFooter.displayName = "FormFooter";

const FormSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn(
      "my-6 border-t border-border opacity-70",
      className
    )}
    {...props}
  />
));
FormSeparator.displayName = "FormSeparator";

const FormHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-medium mb-4",
      className
    )}
    {...props}
  />
));
FormHeading.displayName = "FormHeading";

const FormInlineMessage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "error" }
>(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
      "transition-all duration-200",
      variant === "success" && "bg-green-50 text-green-700 border border-green-200",
      variant === "warning" && "bg-yellow-50 text-yellow-700 border border-yellow-200",
      variant === "error" && "bg-red-50 text-red-700 border border-red-200",
      variant === "default" && "bg-gray-50 text-gray-700 border border-gray-200",
      className
    )}
    {...props}
  />
));
FormInlineMessage.displayName = "FormInlineMessage";

const FormGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group space-y-4 mb-6 transition-all duration-200",
      className
    )}
    {...props}
  />
));
FormGroup.displayName = "FormGroup";

const FormFieldset = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn(
      "border border-input rounded-md p-4 space-y-4",
      "transition-all duration-200 hover:border-primary/50 focus-within:border-primary",
      className
    )}
    {...props}
  />
));
FormFieldset.displayName = "FormFieldset";

const FormLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => (
  <legend
    ref={ref}
    className={cn(
      "text-sm font-medium px-2 -ml-1",
      className
    )}
    {...props}
  />
));
FormLegend.displayName = "FormLegend";

export {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormGroup,
  FormFieldset,
  FormLegend,
  FormRow,
  FormHint,
  FormHeader,
  FormFooter,
  FormSeparator,
};