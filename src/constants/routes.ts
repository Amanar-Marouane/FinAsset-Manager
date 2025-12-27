// -------------------- API VERSION --------------------
const CURRENT_VERSION = 'v1';
const AUTH_URL = '/auth';

// -------------------- API ROUTES Object --------------------
export const ROUTES = {
  // ----- Auth -----
  login: `${AUTH_URL}/sign-in`,
  logout: `${AUTH_URL}/sign-out`,
  forgotPassword: `${AUTH_URL}/forgot-password`,
  changePassword: `${AUTH_URL}/change-password`,
  isLogged: `/is-logged`,
  profile: `/${CURRENT_VERSION}/profile`,

  // ----- Protected Modules -----
  investTypes: {
    index: `/${CURRENT_VERSION}/invest-types`,
    all: `/${CURRENT_VERSION}/invest-types/all`,
    create: `/${CURRENT_VERSION}/invest-types/create`,
    store: `/${CURRENT_VERSION}/invest-types/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/invest-types/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/invest-types/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/invest-types/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/invest-types/delete/${id}`,
  },
  projects: {
    index: `/${CURRENT_VERSION}/projects`,
    create: `/${CURRENT_VERSION}/projects/create`,
    store: `/${CURRENT_VERSION}/projects/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/projects/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/projects/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/projects/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/projects/delete/${id}`,
    byYearAndType: `/${CURRENT_VERSION}/projects/by-year`,
  },
  projectEntries: {
    store: `/${CURRENT_VERSION}/project-entries/store`,
    delete: `/${CURRENT_VERSION}/project-entries/delete`,
  },
  credits: {
    index: `/${CURRENT_VERSION}/credits`,
    all: `/${CURRENT_VERSION}/credits/all`,
    create: `/${CURRENT_VERSION}/credits/create`,
    store: `/${CURRENT_VERSION}/credits/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/credits/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/credits/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/credits/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/credits/delete/${id}`,
  },
  creditEntries: {
    store: `/${CURRENT_VERSION}/credit-entries/store`,
    delete: `/${CURRENT_VERSION}/credit-entries/delete`,
  },
  prets: {
    index: `/${CURRENT_VERSION}/prets`,
    all: `/${CURRENT_VERSION}/prets/all`,
    create: `/${CURRENT_VERSION}/prets/create`,
    store: `/${CURRENT_VERSION}/prets/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/prets/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/prets/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/prets/show/${id}`,
    delete: (id: string | number) => `/${CURRENT_VERSION}/prets/delete/${id}`,
  },
  pretEntries: {
    store: `/${CURRENT_VERSION}/pret-entries/store`,
    delete: `/${CURRENT_VERSION}/pret-entries/delete`,
  },
  loans: {
    index: `/${CURRENT_VERSION}/loans`,
    create: `/${CURRENT_VERSION}/loans/create`,
    store: `/${CURRENT_VERSION}/loans/store`,
    edit: (id: string | number) => `/${CURRENT_VERSION}/loans/edit/${id}`,
    update: (id: string | number) => `/${CURRENT_VERSION}/loans/update/${id}`,
    show: (id: string | number) => `/${CURRENT_VERSION}/loans/show/${id}`,
  },
  dashboard: {
    metrics: `/${CURRENT_VERSION}/dashboard/metrics`,
  },
  bankAccounts: {
    index: `/${CURRENT_VERSION}/bank-accounts`,
    all: `/${CURRENT_VERSION}/bank-accounts/all`,
    byYear: (year: string | number) => `/${CURRENT_VERSION}/bank-accounts/year/${year}`,
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
    byDateAndAccountId: (id: string | number) => `/${CURRENT_VERSION}/account-balances/by-date-and-account-id/${id}`,
  },
  othersBalances: {
    index: `/${CURRENT_VERSION}/others-balances`,
    byYear: (year: string | number) => `/${CURRENT_VERSION}/others-balances/year/${year}`,
    store: `/${CURRENT_VERSION}/others-balances/store`,
  },
};
