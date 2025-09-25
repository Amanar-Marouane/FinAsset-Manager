export interface NavItem {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  shortcut?: string[];
  items?: NavItem[];
  permission?: string | null;
}

export const navItems: NavItem[] = [];
