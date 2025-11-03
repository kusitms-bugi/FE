import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-yellow-400 text-grey-1000 hover:bg-yellow-500 active:bg-yellow-600 disabled:bg-yellow-100 disabled:text-grey-0 cursor-pointer',
      },
      size: {
        xs: 'h-[33px] px-3 text-caption-sm-medium',
        sm: 'h-10 px-4 text-body-md-medium',
        md: 'h-10 px-5 text-body-md-medium',
        lg: 'h-[51px] px-6 text-body-lg-medium',
        xl: 'h-[59px] px-7 text-body-lg-medium ',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  text?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, text, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {text}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
