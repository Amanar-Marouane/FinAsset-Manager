import React from 'react';

interface HeaderProps {
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showSidebar?: boolean;
  showSeparator?: boolean;
  className?: string;
}

export default function Header({
  leftContent,
  rightContent,
  className = '',
}: HeaderProps) {

  return (
    <header
      className={`flex h-12 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ${className}`}
    >
      <div className='flex items-center gap-2 px-4'>
        {leftContent}
      </div>

      <div className='flex items-center gap-2 px-4'>
        {rightContent}
      </div>
    </header>
  );
}
