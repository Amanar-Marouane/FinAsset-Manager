'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from '@/constants/routes';
import AccountBalanceList from '@/features/dashboard/components/account-balance-list';
import useApi from '@/hooks/use-api';
import {
    Building2,
    Car,
    CreditCard,
    DollarSign,
    FolderKanban,
    HandCoins,
    MapPin,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DashboardMetrics {
    counts: {
        buildings: number;
        building_types: number;
        banks: number;
        bank_accounts: number;
        account_balances: number;
        cars: number;
        terrains: number;
        projects: number;
        credits: number;
        prets: number;
    };
    totals: {
        projects_total_net: string;
        projects_total_capital: string;
        credits_total_montant: string;
        credits_total_monthly_payment: string;
        prets_total_montant: string;
        bank_accounts_total_initial_balance: string;
        cars_total_value: string;
        current_month_balances_total: string;
        current_month_balances_count: number;
        net_loans_position: string;
    };
}

function formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0,00 MAD';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD'
    }).format(num);
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend
}: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center mt-2">
                        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
                        {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function Page(): React.JSX.Element {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const { trigger } = useApi();

    // Type guard to validate the metrics structure
    const isValidMetrics = (data: any): data is DashboardMetrics => {
        return data &&
            typeof data === 'object' &&
            'counts' in data &&
            'totals' in data &&
            typeof data.counts === 'object' &&
            typeof data.totals === 'object';
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                // The API wraps the response in { status, message, data }
                const response = await trigger<{ status: string; message: string; data: DashboardMetrics }>(ROUTES.dashboard.metrics);

                // Extract the actual metrics from response.data.data
                const metricsData = response.data?.data;

                // Validate the response structure
                if (metricsData && isValidMetrics(metricsData)) {
                    setMetrics(metricsData);
                } else {
                    setMetrics(null);
                }
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error);
                setMetrics(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const netLoansPosition = metrics?.totals?.net_loans_position ? parseFloat(metrics.totals.net_loans_position) : 0;
    const isPositivePosition = netLoansPosition > 0;

    return (
        <PageContainer scrollable={false}>
            <div className="flex flex-col space-y-4 w-full">
                <div className="flex items-center justify-between space-y-2">
                    <Heading title="Dashboard" description="Vue d'ensemble de vos actifs financiers" />
                </div>
                <Separator />

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                        <TabsTrigger value="assets">Actifs</TabsTrigger>
                        <TabsTrigger value="finances">Finances</TabsTrigger>
                        <TabsTrigger value="balances">Soldes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {loading ? (
                            <LoadingSkeleton />
                        ) : metrics ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <StatCard
                                        title="Projets"
                                        value={metrics.counts.projects}
                                        description={`Capital total: ${formatCurrency(metrics.totals.projects_total_capital)}`}
                                        icon={FolderKanban}
                                    />
                                    <StatCard
                                        title="Net Mensuel Projets"
                                        value={formatCurrency(metrics.totals.projects_total_net)}
                                        description="Revenu mensuel total"
                                        icon={TrendingUp}
                                        trend="up"
                                    />
                                    <StatCard
                                        title="Voitures"
                                        value={metrics.counts.cars}
                                        description={`Valeur totale: ${formatCurrency(metrics.totals.cars_total_value)}`}
                                        icon={Car}
                                    />
                                    <StatCard
                                        title="Terrains"
                                        value={metrics.counts.terrains}
                                        description="Propriétés foncières"
                                        icon={MapPin}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <StatCard
                                        title="Crédits (Entrants)"
                                        value={formatCurrency(metrics.totals.credits_total_montant)}
                                        description={`Mensualité: ${formatCurrency(metrics.totals.credits_total_monthly_payment)}`}
                                        icon={CreditCard}
                                    />
                                    <StatCard
                                        title="Prêts (Sortants)"
                                        value={formatCurrency(metrics.totals.prets_total_montant)}
                                        description={`${metrics.counts.prets} prêt(s) actif(s)`}
                                        icon={HandCoins}
                                    />
                                    <StatCard
                                        title="Position Nette Prêts"
                                        value={formatCurrency(metrics.totals.net_loans_position)}
                                        description={isPositivePosition ? "Vous prêtez plus" : "Vous empruntez plus"}
                                        icon={DollarSign}
                                        trend={isPositivePosition ? 'up' : 'down'}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Comptes Bancaires</CardTitle>
                                            <CardDescription>
                                                {metrics.counts.bank_accounts} compte(s) dans {metrics.counts.banks} banque(s)
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {formatCurrency(metrics.totals.bank_accounts_total_initial_balance)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Solde initial total
                                            </p>
                                            <div className="mt-4">
                                                <p className="text-sm font-medium">
                                                    Solde du mois en cours: {formatCurrency(metrics.totals.current_month_balances_total)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {metrics.totals.current_month_balances_count} compte(s) mis à jour
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Bâtiments</CardTitle>
                                            <CardDescription>
                                                {metrics.counts.buildings} bâtiment(s) de {metrics.counts.building_types} type(s)
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center">
                                                <Building2 className="h-12 w-12 text-muted-foreground mr-4" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Gestion de propriétés immobilières
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="assets" className="space-y-4">
                        {loading ? (
                            <LoadingSkeleton />
                        ) : metrics ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <StatCard
                                    title="Bâtiments"
                                    value={metrics.counts.buildings}
                                    description={`${metrics.counts.building_types} type(s) de bâtiment`}
                                    icon={Building2}
                                />
                                <StatCard
                                    title="Voitures"
                                    value={metrics.counts.cars}
                                    description={`Valeur: ${formatCurrency(metrics.totals.cars_total_value)}`}
                                    icon={Car}
                                />
                                <StatCard
                                    title="Terrains"
                                    value={metrics.counts.terrains}
                                    description="Propriétés foncières"
                                    icon={MapPin}
                                />
                            </div>
                        ) : null}
                    </TabsContent>

                    <TabsContent value="finances" className="space-y-4">
                        {loading ? (
                            <LoadingSkeleton />
                        ) : metrics ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Projets</CardTitle>
                                            <CardDescription>{metrics.counts.projects} projet(s) actif(s)</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Capital Total</p>
                                                <p className="text-2xl font-bold">{formatCurrency(metrics.totals.projects_total_capital)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Net Mensuel Total</p>
                                                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totals.projects_total_net)}/mois</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Crédits & Prêts</CardTitle>
                                            <CardDescription>Gestion des emprunts</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Crédits (Entrants)</p>
                                                <p className="text-xl font-bold">{formatCurrency(metrics.totals.credits_total_montant)}</p>
                                                <p className="text-xs text-muted-foreground">Mensualité: {formatCurrency(metrics.totals.credits_total_monthly_payment)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Prêts (Sortants)</p>
                                                <p className="text-xl font-bold">{formatCurrency(metrics.totals.prets_total_montant)}</p>
                                            </div>
                                            <div className={`p-3 rounded-lg ${isPositivePosition ? 'bg-green-50' : 'bg-red-50'}`}>
                                                <p className="text-sm font-medium">Position Nette</p>
                                                <p className={`text-xl font-bold ${isPositivePosition ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(metrics.totals.net_loans_position)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        ) : null}
                    </TabsContent>

                    <TabsContent value="balances" className="space-y-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                            <h3 className="text-lg font-medium mb-4">Soldes des Comptes</h3>
                            <AccountBalanceList />
                            <p className="text-sm text-muted-foreground mt-4">Sélectionnez un compte pour voir son historique de soldes.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </PageContainer>
    );
}
