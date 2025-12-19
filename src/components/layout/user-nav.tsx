'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserDropdownMenu } from './user-dropdown-menu';
import { User } from '@/contexts/AppProvider';
import Image from 'next/image';

export function UserNav({
  user,
  className = '',
  logout = () => {},
}: {
  user: User | null;
  badgeClassName?: string;
  className?: string;
  logout?: () => void;
}) {
  const UserAvatar = ({ user, className = '' }: { user: User | null; className?: string }) => (
    <div
      className={`${className}`}
    >
      {user?.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          width={32}
          height={32}
          className='w-full h-full rounded-full object-cover'
        />
      ) : (
        user?.name?.charAt(0)?.toUpperCase() || 'U'
      )}
    </div>
  );

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className={`relative h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold ${className}`}
          >
            <UserAvatar user={user} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          // className='w-56'
          align='end'
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className='font-normal flex flex-col items-start'>
            <div className='flex justify-between items-center space-y-1 w-full'>
              <p className='text-sm leading-none font-medium'>{user.name}</p>
            </div>
            <p className='text-muted-foreground text-xs leading-none'>
              {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <UserDropdownMenu onSignOut={() => logout()} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
