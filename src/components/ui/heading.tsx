import React from "react";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description = '',
  className = '',
  size = 'md',
  align = 'left',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'text-xl sm:text-2xl'
      : size === 'lg'
        ? 'text-3xl sm:text-4xl'
        : 'text-2xl sm:text-3xl';

  const alignClasses =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <div className={`min-w-0 space-y-1 sm:space-y-1.5 ${alignClasses} ${className}`}>
      <h2 className={`${sizeClasses} font-bold tracking-tight truncate`}>{title}</h2>
      {description && (
        <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">{description}</p>
      )}
    </div>
  );
};
