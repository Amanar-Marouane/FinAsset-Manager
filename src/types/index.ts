import { Icons } from '@/components/icons';
import { User } from '@/contexts/AppProvider';

interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
  permission?: string;
}

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: User | null;
}

interface BuildingType {
  id: string;
  name: string;
}

interface Car {
  id: number;
  name: string;
  model: string | null;
  year: number | null;
  bought_at: string | null;
  price: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Terrain {
  id: number;
  name: string;
  address: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Project {
  id: number;
  name: string;
  capital: string;
  net: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Credit {
  id: number;
  montant: string;
  monthly_payment: string | null;
  organization: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Pret {
  id: number;
  montant: string;
  monthly_payment: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type { NavItem, UserAvatarProfileProps, BuildingType, Car, Terrain, Project, Credit, Pret };
