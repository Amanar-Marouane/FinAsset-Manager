import { NavItem } from '@/types';
import { APP_ROUTES } from './app-routes';

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: APP_ROUTES.dashboard,
    icon: "dashboard",
  },
  {
    title: "Compte Bancaire",
    url: APP_ROUTES.comptesBancaires.index,
    icon: "bank",
  },
  {
    title: "Projets",
    url: APP_ROUTES.projets.index,
    icon: "project",
  },
  {
    title: "Crédits",
    url: APP_ROUTES.credits.index,
    icon: "credit",
  },
  {
    title: "Prêts",
    url: APP_ROUTES.prets.index,
    icon: "loan",
  },
];
