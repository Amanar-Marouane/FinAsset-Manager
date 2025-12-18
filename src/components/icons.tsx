import { IconProps } from "@radix-ui/react-icons/dist/types";
import { Banknote, Briefcase, Building2, Car, CreditCard, Home, Sprout, Wallet } from "lucide-react";

import React from 'react';

export type Icon = React.ComponentType<IconProps>;

export const Icons: Record<string, Icon> = {
  dashboard: Home,
  bank: Wallet,
  car: Car,
  building: Building2,
  project: Briefcase,
  credit: CreditCard,
  loan: Banknote,
  land: Sprout,
};