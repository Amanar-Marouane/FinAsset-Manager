// -------------------- API VERSION --------------------
const CURRENT_VERSION = 'v1';
const AUTH_URL = '/auth';

// -------------------- API ROUTES Object --------------------
export const ROUTES = {
  // ----- Auth -----
  login: `${AUTH_URL}/sign-in`,
  logout: `${AUTH_URL}/sign-out`,
  forgotPassword: `${AUTH_URL}/forgot-password`,
  isLogged: `/is-logged`,

  // ----- Protected Modules -----
  buildings: {
    index: `/${CURRENT_VERSION}/buildings`,
    create: `/${CURRENT_VERSION}/buildings/create`,
    store: `/${CURRENT_VERSION}/buildings/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/buildings/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/buildings/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/buildings/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/buildings/delete/${id}`,
  },
  buildingTypes: {
    index: `/${CURRENT_VERSION}/building-types`,
    all: `/${CURRENT_VERSION}/building-types/all`,
    create: `/${CURRENT_VERSION}/building-types/create`,
    store: `/${CURRENT_VERSION}/building-types/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/building-types/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/building-types/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/building-types/show/${id}`,
  },
  cars: {
    index: `/${CURRENT_VERSION}/cars`,
    create: `/${CURRENT_VERSION}/cars/create`,
    store: `/${CURRENT_VERSION}/cars/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/cars/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/cars/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/cars/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/cars/delete/${id}`,
  },
  projects: {
    index: `/${CURRENT_VERSION}/projects`,
    create: `/${CURRENT_VERSION}/projects/create`,
    store: `/${CURRENT_VERSION}/projects/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/projects/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/projects/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/projects/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/projects/delete/${id}`,
  },
  credits: {
    index: `/${CURRENT_VERSION}/credits`,
    create: `/${CURRENT_VERSION}/credits/create`,
    store: `/${CURRENT_VERSION}/credits/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/credits/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/credits/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/credits/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/credits/delete/${id}`,
  },
  prets: {
    index: `/${CURRENT_VERSION}/prets`,
    create: `/${CURRENT_VERSION}/prets/create`,
    store: `/${CURRENT_VERSION}/prets/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/prets/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/prets/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/prets/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/prets/delete/${id}`,
  },
  loans: {
    index: `/${CURRENT_VERSION}/loans`,
    create: `/${CURRENT_VERSION}/loans/create`,
    store: `/${CURRENT_VERSION}/loans/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/loans/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/loans/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/loans/show/${id}`,
  },
  terrains: {
    index: `/${CURRENT_VERSION}/terrains`,
    create: `/${CURRENT_VERSION}/terrains/create`,
    store: `/${CURRENT_VERSION}/terrains/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/terrains/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/terrains/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/terrains/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/terrains/delete/${id}`,
  },
  dashboard: {
    metrics: `/${CURRENT_VERSION}/dashboard/metrics`,
  },
  bankAccounts: {
    index: `/${CURRENT_VERSION}/bank-accounts`,
    create: `/${CURRENT_VERSION}/bank-accounts/create`,
    store: `/${CURRENT_VERSION}/bank-accounts/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/bank-accounts/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/bank-accounts/update/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/bank-accounts/delete/${id}`,
  },
  banks: {
    index: `/${CURRENT_VERSION}/banks`,
    all: `/${CURRENT_VERSION}/banks/all`,
    create: `/${CURRENT_VERSION}/banks/create`,
    store: `/${CURRENT_VERSION}/banks/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/banks/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/banks/update/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/banks/delete/${id}`,
  },
  accountBalances: {
    index: `/${CURRENT_VERSION}/account-balances`,
    store: `/${CURRENT_VERSION}/account-balances/store`,
    update: (id: string | number) => `/${CURRENT_VERSION}/account-balances/update/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/account-balances/delete/${id}`,
  },
};
