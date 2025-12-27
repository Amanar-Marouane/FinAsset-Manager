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
  type_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  entries?: ProjectEntry[];
  type: InvestType;
}

interface ProjectEntry {
  id: string;
  project_id: number;
  amount: string;
  previous_year_last_entry: string | null;
  month: string;
  year: string;
}

interface InvestType {
  id: number;
  name: string;
}

interface Credit {
  id: number;
  to: string;
  montant: string;
  entries?: CreditEntry[];
  entries_total_before_current_year: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CreditEntry {
  id: number;
  credit_id: number;
  amount: string;
  month: number;
  year: number;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Pret {
  id: number;
  organization: string;
  montant: string;
  montant_net: string;
  monthly_payment: string | null;
  entries?: PretEntry[];
  entries_total_before_current_year: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface PretEntry {
  id: number;
  pret_id: number;
  amount: string;
  month: number;
  year: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type {
  NavItem,
  UserAvatarProfileProps,
  BuildingType,
  Car,
  Terrain,
  Project,
  Credit,
  CreditEntry,
  Pret,
  PretEntry,
  ProjectEntry,
  InvestType
};
