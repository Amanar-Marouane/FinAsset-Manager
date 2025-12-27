const PROTECTED_PREFIX = `/protected`; // Protected routes prefix

export const APP_ROUTES = {
    signIn: `/sign-in`,
    forgotPassword: `/forgot-password`,

    // Dashboard
    dashboard: `${PROTECTED_PREFIX}`,

    // Protected module routes (list view)
    comptesBancaires: {
        index: `${PROTECTED_PREFIX}/comptes-bancaires`,
    },
    projets: {
        index: `${PROTECTED_PREFIX}/projets`,
    },
    credits: {
        index: `${PROTECTED_PREFIX}/credits`,
    },
    prets: {
        index: `${PROTECTED_PREFIX}/prets`,
    },
    banques: {
        index: `${PROTECTED_PREFIX}/banques`,
    },
    profil: {
        index: `${PROTECTED_PREFIX}/profile`,
    },
};