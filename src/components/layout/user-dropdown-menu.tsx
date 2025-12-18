'use client';

import {
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
    IconUser
} from '@tabler/icons-react';


interface UserDropdownMenuProps {
    signOutClassName?: string;
    permissions?: string[];
    hasPermissionFn?: (permissions: string[], permission: string) => boolean;
    profileUrl?: string;
    onSignOut?: () => void;
}

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

    return (
        <>
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