'use client';
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
    SidebarRail
} from '@/components/ui/sidebar';
import {
    IconChevronRight,
    IconChevronsDown,
    IconHome,
    IconUsers,
    IconSettings,
    IconUser
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

/**
 * General Navigation Sidebar Component
 * 
 * Usage Examples:
 * 
 * 1. Basic usage with default navigation:
 * <NavigationSidebar />
 * 
 * 2. Custom navigation items:
 * <NavigationSidebar
 *   logoSrc="/custom-logo.png"
 *   logoAlt="Custom Logo"
 *   homeUrl="/dashboard"
 *   menuItems={customMenuItems}
 *   user={currentUser}
 * />
 * 
 * 3. With permission checking:
 * <NavigationSidebar
 *   menuItems={menuItems}
 *   user={user}
 *   permissions={userPermissions}
 *   hasPermissionFn={checkPermission}
 * />
 */

interface NavigationItem {
    title: string;
    url: string;
    icon?: React.ComponentType<any>;
    permission?: string;
    isActive?: boolean;
    items?: Array<{
        title: string;
        url: string;
        permission?: string;
    }>;
}

interface User {
    name?: string;
    email?: string;
    avatar?: string;
    initials?: string;
}

interface NavigationSidebarProps {
    logoSrc?: string;
    logoAlt?: string;
    logoWidth?: number;
    logoHeight?: number;
    homeUrl?: string;
    menuItems?: NavigationItem[];
    user?: User | null;
    permissions?: string[];
    hasPermissionFn?: (permissions: string[] | undefined, permission: string | undefined) => boolean;
    onSignOut?: () => void;
    className?: string;
}

// Default fallback menu items
const defaultMenuItems: NavigationItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconHome,
    },
    {
        title: 'Users',
        url: '/users',
        icon: IconUsers,
        items: [
            { title: 'All Users', url: '/users' },
            { title: 'Add User', url: '/users/add' },
            { title: 'User Roles', url: '/users/roles' },
        ]
    },
    {
        title: 'Settings',
        url: '/settings',
        icon: IconSettings,
    }
];

// Default permission checker
const defaultHasPermission = (permissions: string[] | undefined, permission: string | undefined): boolean => {
    if (!permission) return true;
    if (!permissions) return false;
    return permissions.includes(permission);
};

export default function NavigationSidebar({
    logoSrc = "/logo.png",
    logoAlt = "Logo",
    logoWidth = 80,
    logoHeight = 80,
    homeUrl = "/",
    menuItems = defaultMenuItems,
    user = { name: "Sample User", email: "user@example.com", initials: "SU" },
    permissions = [],
    hasPermissionFn = defaultHasPermission,
    onSignOut,
    className = ""
}: NavigationSidebarProps) {
    const pathname = usePathname();

    const handleSignOut = () => {
        if (onSignOut) {
            onSignOut();
        } else {
            // Default sign out behavior
            console.log('Sign out clicked - implement your sign out logic');
        }
    };

    return (
        <Sidebar collapsible='icon' className={`bg-sidebar text-sidebar-foreground ${className}`}>
            <SidebarHeader className='flex items-center justify-between px-4'>
                <Link href={homeUrl}>
                    <Image
                        src={logoSrc}
                        alt={logoAlt}
                        width={logoWidth}
                        height={logoHeight}
                        className="object-contain"
                        onError={(e) => {
                            // Fallback to a simple text logo if image fails
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

                            const Icon = item.icon || IconHome;

                            return item?.items && item?.items?.length > 0 ? (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={item.isActive}
                                    className='group/collapsible'
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                isActive={pathname === item.url}
                                                className="py-3 text-xl font-semibold text-sidebar-foreground hover:bg-sidebar-accent"
                                            >
                                                <Icon className="text-sidebar-foreground" size={24} />
                                                <span className="text-sidebar-foreground">{item.title}</span>
                                                <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 h-6 w-6 text-sidebar-foreground' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => {
                                                    if (subItem.permission && !hasPermissionFn(permissions, subItem.permission)) {
                                                        return null;
                                                    }

                                                    return (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === subItem.url}
                                                                className="py-2.5 text-base text-sidebar-foreground/80 hover:bg-primary"
                                                            >
                                                                <Link href={subItem.url}>
                                                                    <span className="text-sidebar-foreground">{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
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
                                        className="py-4 text-lg font-semibold text-sidebar-foreground hover:bg-primary"
                                    >
                                        <Link href={item.url}>
                                            <Icon className="h-6 w-6 text-sidebar-foreground" />
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
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                                            {user?.avatar ? (
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name || "User"}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-lg"
                                                />
                                            ) : (
                                                user?.initials || user?.name?.charAt(0)?.toUpperCase() || "U"
                                            )}
                                        </div>
                                        <div className="text-left text-sm">
                                            <div className="font-semibold">{user?.name || "User"}</div>
                                            <div className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</div>
                                        </div>
                                    </div>
                                    <IconChevronsDown className='ml-auto size-4' />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg card-bg border-border'
                                side='bottom'
                                align='end'
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className='p-0 font-normal'>
                                    <div className='px-1 py-1.5'>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                                                {user?.avatar ? (
                                                    <Image
                                                        src={user.avatar}
                                                        alt={user.name || "User"}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-lg"
                                                    />
                                                ) : (
                                                    user?.initials || user?.name?.charAt(0)?.toUpperCase() || "U"
                                                )}
                                            </div>
                                            <div className="text-left text-sm">
                                                <div className="font-semibold">{user?.name || "User"}</div>
                                                <div className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="border-border" />
                                <SidebarMenuButton
                                    onClick={handleSignOut}
                                    className="w-full text-left hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <IconUser className="mr-2 h-4 w-4" />
                                    Sign Out
                                </SidebarMenuButton>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
