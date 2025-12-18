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
    title: "Voitures",
    url: APP_ROUTES.voitures.index,
    icon: "car",
  },
  {
    title: "Bâtiments",
    url: APP_ROUTES.batiments.index,
    icon: "building",
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
  {
    title: "Terrains",
    url: APP_ROUTES.terrains.index,
    icon: "land",
  },
];
