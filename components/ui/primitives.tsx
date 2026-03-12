import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'icon' | 'lg';
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] after:absolute after:inset-0 after:rounded-2xl after:shadow-[0_0_20px_hsl(var(--primary)/0.3)] after:opacity-0 hover:after:opacity-100 after:transition-opacity',
      outline: 'border border-foreground/10 bg-foreground/[0.03] backdrop-blur-md hover:bg-foreground/[0.08] hover:border-primary/50 hover:scale-[1.02] text-foreground',
      ghost: 'hover:bg-foreground/[0.05] hover:text-foreground transition-colors',
      destructive: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02]',
    };
    const sizes = {
      default: 'h-11 px-6 py-2.5',
      sm: 'h-9 rounded-xl px-4',
      lg: 'h-12 rounded-[1.25rem] px-8 text-base',
      icon: 'h-10 w-10 rounded-xl',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-2xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// --- Card ---
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-[2.5rem] border border-foreground/10 bg-card/60 dark:bg-white/[0.03] backdrop-blur-2xl text-card-foreground shadow-premium transition-all duration-500 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] hover:border-foreground/20 dark:hover:border-white/20', className)} {...props} />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-2 p-8', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-2xl font-black leading-none tracking-tight text-card-foreground', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-8 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// --- Badge ---
export const Badge = ({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'destructive' }) => {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-white/5 text-muted-foreground border-white/10",
    destructive: "bg-red-500/10 text-red-500 border-red-500/20",
    outline: "text-foreground border-white/10 bg-transparent",
  }
  return (
    <div className={cn("inline-flex items-center rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all", variants[variant], className)} {...props} />
  );
};

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-4 py-2 text-sm text-foreground ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-foreground/[0.05] focus-visible:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

// --- Sheet (Custom Implementation using Framer Motion) ---
interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  )
}

export const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: 'right' | 'left' }>(({ className, children, ...props }, ref) => (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "100%", opacity: 0 }}
    transition={{ type: "spring", damping: 30, stiffness: 300 }}
    className={cn("relative z-50 h-full w-full sm:w-[450px] border-l border-foreground/10 bg-background/80 dark:bg-black/40 backdrop-blur-3xl p-8 shadow-2xl overflow-y-auto", className)}
    {...props}
    ref={ref}
  >
    {children}
  </motion.div>
));
SheetContent.displayName = "SheetContent";

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 mb-8", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-3xl font-black tracking-tight text-foreground", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-base text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = "SheetDescription";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{ dragControls: any; isDraggable: boolean } | null>(null);

export const Dialog: React.FC<DialogProps & { className?: string; isDraggable?: boolean }> = ({
  open,
  onOpenChange,
  children,
  className,
  isDraggable = false
}) => {
  const dragControls = useDragControls();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <DialogContext.Provider value={{ dragControls, isDraggable }}>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-20 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              style={{ pointerEvents: 'auto' }}
            />
            <motion.div
              {...(isDraggable ? {
                drag: true,
                dragControls: dragControls,
                dragListener: false,
                dragMomentum: false,
              } : {})}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn("relative z-[100] w-full max-w-fit pointer-events-auto", className)}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>,
    document.body
  );
};

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative grid w-full gap-6 border border-foreground/10 bg-background/80 dark:bg-black/40 text-card-foreground p-8 shadow-2xl rounded-[2rem] overflow-hidden backdrop-blur-3xl", className)} {...props}>
    {children}
  </div>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const context = React.useContext(DialogContext);
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left select-none",
        context?.isDraggable ? "cursor-move active:cursor-grabbing" : "",
        className
      )}
      onPointerDown={(e) => context?.isDraggable ? context.dragControls.start(e) : undefined}
      {...props}
    />
  );
};
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-2xl font-bold tracking-tight text-foreground pointer-events-none", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

// --- Select (Primitive helper for consistent styling) ---
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-2xl border border-foreground/10 bg-foreground/[0.05] px-4 py-2 text-sm text-foreground ring-offset-background transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";