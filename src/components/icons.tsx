import { Banknote, BanknoteX, Briefcase, Building2, Car, CreditCard, Home, LucideIcon, PiggyBank, Sprout, Wallet } from "lucide-react";

import React from 'react';

export type Icon = React.ComponentType<LucideIcon>;
export const Icons: Record<string, LucideIcon> = {
  dashboard: Home,
  bank: Wallet,
  car: Car,
  building: Building2,
  project: Briefcase,
  credit: CreditCard,
  loan: Banknote,
  land: Sprout,
  IconBuildingCommunity: Building2,
  IconBuildingBank: BanknoteX,
};