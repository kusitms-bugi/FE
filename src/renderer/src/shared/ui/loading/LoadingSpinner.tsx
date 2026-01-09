import { cn } from '@shared/lib/cn';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
};

export const LoadingSpinner = ({
  className,
  size = 'md',
  text,
}: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-yellow-400 border-t-transparent',
          sizeClasses[size],
        )}
        role="status"
        aria-label="로딩 중"
      >
        <span className="sr-only">로딩 중...</span>
      </div>
      {text && (
        <p className="text-body-md-medium text-grey-400">{text}</p>
      )}
    </div>
  );
};

