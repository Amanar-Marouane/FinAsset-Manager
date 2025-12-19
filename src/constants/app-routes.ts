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
    voitures: {
        index: `${PROTECTED_PREFIX}/voitures`,
    },
    batiments: {
        index: `${PROTECTED_PREFIX}/batiments`,
    },
    typesDeBatiments: {
        index: `${PROTECTED_PREFIX}/types-de-batiments`,
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
    terrains: {
        index: `${PROTECTED_PREFIX}/terrains`,
    },
};