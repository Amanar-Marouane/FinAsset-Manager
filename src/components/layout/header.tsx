import React from 'react';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';
import { useAppContext } from '@/hooks/use-app-context';

interface HeaderProps {
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showSidebar?: boolean;
  showSeparator?: boolean;
  className?: string;
}

export default function Header({
  children,
  leftContent,
  rightContent,
  showSidebar = true,
  showSeparator = true,
  className = '',
}: HeaderProps) {
  // Default breadcrumb component
  const DefaultBreadcrumb = () => (
    <nav className='flex items-center space-x-2 text-sm text-muted-foreground'>
      <span>Dashboard</span>
      <span>/</span>
      <span className='text-foreground'>Current Page</span>
    </nav>
  );
  const { user, logout } = useAppContext();

  return (
    <header
      className={`flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ${className}`}
    >
      <div className='flex items-center gap-2 px-4'>
        {showSidebar && <SidebarTrigger />}
        {showSeparator && showSidebar && (
          <Separator orientation='vertical' className='mr-2 h-4' />
        )}
        {leftContent || children || <DefaultBreadcrumb />}
      </div>

      <div className='flex items-center gap-2 px-4'>
        {rightContent || <UserNav user={user} logout={logout} />}
      </div>
    </header>
  );
}
