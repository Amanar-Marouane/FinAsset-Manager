'use client';
import { Icons } from '@/components/icons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { User } from '@/contexts/AppProvider';
import { NavItem } from '@/types';
import {
  IconChevronRight,
  IconChevronsDown
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserDropdownMenu } from './user-dropdown-menu';
import { useAppContext } from '@/hooks/use-app-context';

// Icon mapping
const iconMap = Icons;

interface AppSidebarProps {
  menuItems?: NavItem[];
  permissions?: string[];
  hasPermissionFn?: (permissions: string[], permission: string) => boolean;
  logoSrc?: string;
  logoAlt?: string;
  homeUrl?: string;
  className?: string;
}

export default function AppSidebar({
  menuItems = navItems,
  permissions = [],
  hasPermissionFn = () => true,
  logoSrc = "/logo.png",
  logoAlt = "Logo",
  homeUrl = "/dashboard",
  className = ""
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAppContext();

  const UserAvatarProfile = ({
    user = null,
    className = "",
    showInfo = false
  }: {
    user: User | null;
    className?: string;
    showInfo?: boolean;
  }) => {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
      <div className={`flex items-center gap-2 w-full ${className}`}>
        {/* Avatar ALWAYS visible */}
        <div className="h-8 w-8 shrink-0 rounded-full bg-background flex items-center text-secondary-foreground justify-center text-sm font-semibold overflow-hidden">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            user?.name?.charAt(0)?.toUpperCase() || "U"
          )}
        </div>

        {showInfo && (
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-semibold">
              {user?.name || "User"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {user?.email || ""}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Sidebar
      collapsible='icon'
      className={`bg-sidebar text-sidebar-foreground z-50 sm:z-auto ${className}`}
      aria-label="Navigation latérale"
    >
      <SidebarHeader className='flex items-center justify-between px-4'>
        <Link href={homeUrl}>
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={80}
            height={80}
            onError={(e) => {
              // Hide broken image and show text fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden text-sidebar-foreground'>
        <SidebarGroup className='space-y-4'>
          <SidebarMenu>
            {menuItems.map((item) => {
              if (item.permission && !hasPermissionFn(permissions, item.permission)) {
                return null;
              }

              const Icon = (item.icon && item.icon in iconMap)
                ? iconMap[item.icon as keyof typeof iconMap]
                : Icons.dashboard;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive || false}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                        className="py-3 text-xl font-semibold text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        {item.icon && <Icon fontSize={24} className="text-sidebar-foreground" />}
                        <span className="text-sidebar-foreground">{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 h-6 w-6 text-sidebar-foreground' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                              className="py-2.5 text-base text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                              <Link href={subItem.url}>
                                <span className="text-sidebar-foreground">{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className="py-4 text-lg font-semibold text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Link href={item.url}>
                      <Icon fontSize={24} className="text-sidebar-foreground" />
                      <span className="text-sidebar-foreground">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <UserAvatarProfile
                    className='h-8 w-8 rounded-full'
                    showInfo
                    user={user}
                  />
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-card text-card-foreground border border-border"
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-full'
                      showInfo
                      user={user}
                    />
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-border" />
                <UserDropdownMenu signOutClassName='w-full' onSignOut={() => logout()} />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
