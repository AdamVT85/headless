/**
 * VINTAGE TRAVEL - BUTTON COMPONENT
 * Reusable button component with brand styling
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variants
          variant === 'default' && 'bg-terracotta text-white hover:bg-terracotta/90',
          variant === 'outline' && 'border border-stone-300 bg-white hover:bg-stone-50',
          variant === 'ghost' && 'hover:bg-stone-100',
          // Sizes
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'lg' && 'h-12 px-8 text-lg',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
