'use client';

import {
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
    IconUser
} from '@tabler/icons-react';
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
import { NavItem } from '@/types';
import { APP_ROUTES } from '@/constants/app-routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import { Icon as Icon2 } from 'lucide-react';

interface UserDropdownMenuProps {
    signOutClassName?: string;
    permissions?: string[];
    hasPermissionFn?: (permissions: string[], permission: string) => boolean;
    profileUrl?: string;
    onSignOut?: () => void;
}

const SideItems: NavItem[] = [
    {
        title: 'Types de Bâtiments',
        url: APP_ROUTES.typesDeBatiments.index,
        icon: 'IconBuildingCommunity',
    }
]

export function UserDropdownMenu({
    signOutClassName = "",
    onSignOut
}: UserDropdownMenuProps) {
    const handleSignOut = () => {
        if (onSignOut) {
            onSignOut();
        } else {
            console.log('Sign out clicked - implement your sign out logic');
        }
    };

    const iconMap = Icons;

    return (
        <>
            {
                SideItems.map((item) => {
                    const Icon = (item.icon && item.icon in iconMap)
                        ? iconMap[item.icon as keyof typeof iconMap]
                        : Icons.dashboard;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <Link
                                    href={item.url}
                                    className="bg-primary flex items-center justify-between gap-2 rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span className="text-sm font-medium">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })
            }
            <DropdownMenuItem
                onClick={handleSignOut}
                className={`bg-destructive text-white cursor-pointer focus:bg-destructive/90 focus:text-white ${signOutClassName}`}
            >
                <IconUser className="mr-2 h-4 w-4 stroke-white" />
                Sign Out
            </DropdownMenuItem>
        </>
    );
}