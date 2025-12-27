'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from '@/constants/routes';
import AccountBalanceList from '@/features/dashboard/components/account-balance-list';
import useApi from '@/hooks/use-api';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    DollarSign,
    HandCoins,
    HelpCircle,
    PiggyBank,
    TrendingDown,
    TrendingUp,
    Wallet,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DashboardMetrics {
    counts: {
        banks: number;
        bank_accounts: number;
        account_balances: number;
        projects: number;
        project_entries: number;
        credits: number;
        credit_entries: number;
        prets: number;
        pret_entries: number;
    };
    totals: {
        projects_total_capital: string;
        projects_entries_total: string;
        projects_entries_current_year: string;
        credits_total_montant: string;
        credits_entries_total: string;
        credits_entries_current_year: string;
        credits_entries_current_month: string;
        prets_total_montant: string;
        prets_total_montant_net: string;
        prets_total_monthly_payment: string;
        prets_entries_total: string;
        prets_entries_current_year: string;
        prets_entries_current_month: string;
        current_month_balances_total: string;
        current_month_balances_count: number;
        all_balances_total: string;
        net_loans_position: string;
        net_loans_entries_current_year: string;
    };
    current_year: number;
    current_month: number;
}

function formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0 MAD';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0
    }).format(num);
}

function formatCompact(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toFixed(0);
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    gradient,
    compact = false
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    gradient?: string;
    compact?: boolean;
}) {
    const displayValue = compact && typeof value === 'string' && value.includes('MAD')
        ? formatCompact(value.replace(/[^0-9.-]/g, '')) + ' MAD'
        : value;

    return (
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {gradient && (
                <div className={`absolute inset-0 ${gradient} opacity-10`} />
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${gradient || 'bg-primary/10'}`}>
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-2xl font-bold tracking-tight">{displayValue}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                        {trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                        {trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function MetricsHelpDialog() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [open, setOpen] = useState(false);

    const slides = [
        {
            title: "Solde Total Actuel",
            description: "La somme de tous vos comptes bancaires pour le mois en cours",
            formula: "Σ Soldes de tous les comptes bancaires (mois actuel)",
            example: "Si vous avez 3 comptes : 10,000 + 25,000 + 8,300 = 43,300 MAD",
            icon: Wallet,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Position Prêts Nette",
            description: "La différence entre ce que vous prêtez et ce que vous empruntez",
            formula: "Prêts Sortants - Crédits Entrants",
            example: "Si Prêts = 1,000,000 et Crédits = 2,250,000\nPosition = 1,000,000 - 2,250,000 = -1,250,000 MAD\n(Vous empruntez plus que vous prêtez)",
            icon: DollarSign,
            color: "from-red-500 to-rose-500",
        },
        {
            title: "Revenus Projets",
            description: "Total des revenus générés par vos projets d'investissement cette année",
            formula: "Σ Entrées des projets (année en cours)",
            example: "Si vous avez 3 projets avec revenus:\nProjet A: 150,000 + Projet B: 120,000 + Projet C: 88,000 = 358,000 MAD",
            icon: Briefcase,
            color: "from-violet-500 to-purple-500",
        },
        {
            title: "Historique Soldes",
            description: "La somme totale de tous les soldes enregistrés (tous les mois confondus)",
            formula: "Σ Tous les soldes bancaires enregistrés",
            example: "Si vous avez enregistré des soldes sur 8 mois pour 6 comptes\n= 48 entrées totales\nSomme = 465,000 MAD",
            icon: PiggyBank,
            color: "from-amber-500 to-orange-500",
        },
        {
            title: "Capital Investi (Projets)",
            description: "Le montant total investi dans tous vos projets",
            formula: "Σ Capital de tous les projets",
            example: "Projet Immobilier: 500,000\nProjet Commerce: 700,000\nProjet Tech: 270,000\nTotal = 1,470,000 MAD",
            icon: Briefcase,
            color: "from-violet-500 to-purple-500",
        },
        {
            title: "Crédits Entrants",
            description: "L'argent que vous recevez (prêts que d'autres vous accordent)",
            formula: "Σ Montants de tous les crédits",
            example: "Crédit Banque A: 1,000,000\nCrédit Personne X: 750,000\nCrédit Entreprise Y: 500,000\nTotal = 2,250,000 MAD",
            icon: CreditCard,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Prêts Sortants",
            description: "L'argent que vous prêtez à d'autres",
            formula: "Σ Montants de tous les prêts",
            example: "Prêt à Personne A: 400,000\nPrêt à Entreprise B: 600,000\nTotal = 1,000,000 MAD\nNet (sans intérêts) = 955,000 MAD",
            icon: HandCoins,
            color: "from-orange-500 to-red-500",
        },
        {
            title: "Flux Année en Cours",
            description: "Différence entre prêts accordés et crédits reçus cette année",
            formula: "Paiements Prêts (année) - Paiements Crédits (année)",
            example: "Prêts versés: 150,000\nCrédits reçus: 340,000\nFlux = 150,000 - 340,000 = -190,000 MAD",
            icon: TrendingDown,
            color: "from-red-500 to-rose-500",
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const slide = slides[currentSlide];
    const Icon = slide.icon;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Aide Métriques
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader className='py-4'>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Guide des Métriques</DialogTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {currentSlide + 1} / {slides.length}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 w-[500px]">
                    {/* Slide Content */}
                    <div className="relative">
                        {/* Header with Icon */}
                        <div className={`flex items-center gap-4 p-6 rounded-lg bg-gradient-to-r ${slide.color} text-white`}>
                            <div className={`p-4 rounded-xl bg-white/20 backdrop-blur-sm`}>
                                <Icon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
                                <p className="text-sm text-white/90 mt-1">{slide.description}</p>
                            </div>
                        </div>

                        {/* Formula Section */}
                        <div className="mt-6 p-4 rounded-lg bg-muted border-2 border-border">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary-foreground">1</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold mb-2 text-foreground">Formule de Calcul</p>
                                    <code className="text-sm bg-background px-3 py-2 rounded block font-mono border text-foreground">
                                        {slide.formula}
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Example Section */}
                        <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">2</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Exemple Pratique</p>
                                    <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line font-mono text-xs bg-white/80 dark:bg-black/30 p-3 rounded border border-green-300 dark:border-green-700">
                                        {slide.example}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Précédent
                        </Button>

                        {/* Dots Indicator */}
                        <div className="flex gap-2">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-2 rounded-full transition-all ${idx === currentSlide
                                        ? 'w-8 bg-primary'
                                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                        }`}
                                />
                            ))}
                        </div>

                        <Button
                            variant={currentSlide === slides.length - 1 ? "default" : "outline"}
                            size="sm"
                            onClick={currentSlide === slides.length - 1 ? () => setOpen(false) : nextSlide}
                        >
                            {currentSlide === slides.length - 1 ? (
                                <>
                                    Terminer
                                    <X className="h-4 w-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    Suivant
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Page(): React.JSX.Element {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const { trigger } = useApi();

    const isValidMetrics = (data: any): data is DashboardMetrics => {
        return data &&
            typeof data === 'object' &&
            'counts' in data &&
            'totals' in data &&
            'current_year' in data &&
            'current_month' in data;
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const response = await trigger<{ status: string; message: string; data: DashboardMetrics }>(ROUTES.dashboard.metrics);
                const metricsData = response.data?.data;

                if (metricsData && isValidMetrics(metricsData)) {
                    setMetrics(metricsData);
                } else {
                    setMetrics(null);
                }
            } catch (e) {
                setMetrics(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const netLoansPosition = metrics?.totals?.net_loans_position ? parseFloat(metrics.totals.net_loans_position) : 0;
    const netLoansCurrentYear = metrics?.totals?.net_loans_entries_current_year ? parseFloat(metrics.totals.net_loans_entries_current_year) : 0;
    const isPositivePosition = netLoansPosition > 0;

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonthName = metrics ? monthNames[metrics.current_month - 1] : '';

    return (
        <PageContainer scrollable={true}>
            <div className="flex flex-col space-y-6 w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading title="Tableau de Bord" description="Vue d'ensemble de votre portefeuille financier" />
                        {metrics && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {currentMonthName} {metrics.current_year}
                            </p>
                        )}
                    </div>
                    <MetricsHelpDialog />
                </div>
                <Separator />

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-background">Vue Générale</TabsTrigger>
                        <TabsTrigger value="projects" className="data-[state=active]:bg-background">Projets</TabsTrigger>
                        <TabsTrigger value="loans" className="data-[state=active]:bg-background">Crédits & Prêts</TabsTrigger>
                        <TabsTrigger value="balances" className="data-[state=active]:bg-background">Comptes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {loading ? (
                            <LoadingSkeleton />
                        ) : metrics ? (
                            <>
                                {/* Hero Stats */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <StatCard
                                        title="Solde Total Actuel"
                                        value={formatCurrency(metrics.totals.current_month_balances_total)}
                                        subtitle={`${metrics.counts.bank_accounts} compte(s) • ${metrics.counts.banks} banque(s)`}
                                        icon={Wallet}
                                        gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                                        compact
                                    />
                                    <StatCard
                                        title="Position Prêts Nette"
                                        value={formatCurrency(Math.abs(netLoansPosition))}
                                        subtitle={isPositivePosition ? "Vous prêtez plus" : "Vous empruntez plus"}
                                        icon={DollarSign}
                                        trend={isPositivePosition ? 'up' : 'down'}
                                        trendValue={formatCurrency(Math.abs(netLoansCurrentYear)) + ` (${metrics.current_year})`}
                                        gradient={isPositivePosition ? "bg-gradient-to-br from-green-500 to-emerald-500" : "bg-gradient-to-br from-red-500 to-rose-500"}
                                        compact
                                    />
                                    <StatCard
                                        title="Revenus Projets"
                                        value={formatCurrency(metrics.totals.projects_entries_current_year)}
                                        subtitle={`${metrics.counts.projects} projet(s) actif(s) • ${metrics.current_year}`}
                                        icon={Briefcase}
                                        trend="up"
                                        trendValue={formatCurrency(metrics.totals.projects_total_capital) + " capital"}
                                        gradient="bg-gradient-to-br from-violet-500 to-purple-500"
                                        compact
                                    />
                                    <StatCard
                                        title="Historique Soldes"
                                        value={formatCurrency(metrics.totals.all_balances_total)}
                                        subtitle={`${metrics.counts.account_balances} entrée(s) totale(s)`}
                                        icon={PiggyBank}
                                        gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                                        compact
                                    />
                                </div>

                                {/* Detailed Cards */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <Card className="border-0 shadow-xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-xl">Projets d'Investissement</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        Performance de vos investissements
                                                    </CardDescription>
                                                </div>
                                                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                                                    <Briefcase className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-lg bg-muted/50">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Capital Investi</p>
                                                    <p className="text-xl font-bold mt-1">{formatCurrency(metrics.totals.projects_total_capital)}</p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-muted/50">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Projets Actifs</p>
                                                    <p className="text-xl font-bold mt-1">{metrics.counts.projects}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenus {metrics.current_year}</p>
                                                        <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
                                                            {formatCurrency(metrics.totals.projects_entries_current_year)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {metrics.counts.project_entries} entrée(s) cette année
                                                        </p>
                                                    </div>
                                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-xl">Crédits & Prêts</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        Gestion de vos flux financiers
                                                    </CardDescription>
                                                </div>
                                                <div className={`p-3 rounded-xl ${isPositivePosition ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'}`}>
                                                    <HandCoins className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1">
                                                        <ArrowDownRight className="h-3 w-3" />
                                                        Crédits Entrants
                                                    </p>
                                                    <p className="text-lg font-bold mt-1">{formatCurrency(metrics.totals.credits_total_montant)}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{metrics.counts.credits} crédit(s)</p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                                                    <p className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wide flex items-center gap-1">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        Prêts Sortants
                                                    </p>
                                                    <p className="text-lg font-bold mt-1">{formatCurrency(metrics.totals.prets_total_montant)}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{metrics.counts.prets} prêt(s)</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activité {metrics.current_year}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Crédits reçus</p>
                                                        <p className="font-semibold">{formatCurrency(metrics.totals.credits_entries_current_year)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Prêts accordés</p>
                                                        <p className="font-semibold">{formatCurrency(metrics.totals.prets_entries_current_year)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        ) : (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-4">
                        {loading ? <LoadingSkeleton /> : metrics ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <StatCard
                                    title="Capital Total"
                                    value={formatCurrency(metrics.totals.projects_total_capital)}
                                    subtitle={`${metrics.counts.projects} projet(s)`}
                                    icon={Briefcase}
                                    gradient="bg-gradient-to-br from-violet-500 to-purple-500"
                                />
                                <StatCard
                                    title={`Revenus ${metrics.current_year}`}
                                    value={formatCurrency(metrics.totals.projects_entries_current_year)}
                                    subtitle={`${metrics.counts.project_entries} entrée(s)`}
                                    icon={TrendingUp}
                                    trend="up"
                                    trendValue="Performance annuelle"
                                    gradient="bg-gradient-to-br from-green-500 to-emerald-500"
                                />
                                <StatCard
                                    title="Revenus Totaux"
                                    value={formatCurrency(metrics.totals.projects_entries_total)}
                                    subtitle="Tous les temps"
                                    icon={DollarSign}
                                    gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                                />
                            </div>
                        ) : null}
                    </TabsContent>

                    <TabsContent value="loans" className="space-y-4">
                        {loading ? <LoadingSkeleton /> : metrics ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card className="border-0 shadow-xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>Crédits (Entrants)</CardTitle>
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Montant Total</p>
                                                <p className="text-2xl font-bold">{formatCurrency(metrics.totals.credits_total_montant)}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                                    <p className="text-xs text-muted-foreground">Reçu {metrics.current_year}</p>
                                                    <p className="text-lg font-bold">{formatCurrency(metrics.totals.credits_entries_current_year)}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                                    <p className="text-xs text-muted-foreground">Total Historique</p>
                                                    <p className="text-lg font-bold">{formatCurrency(metrics.totals.credits_entries_total)}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{metrics.counts.credit_entries} paiement(s) enregistré(s)</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>Prêts (Sortants)</CardTitle>
                                                <HandCoins className="h-5 w-5 text-orange-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Montant Total</p>
                                                <p className="text-2xl font-bold">{formatCurrency(metrics.totals.prets_total_montant)}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Net: {formatCurrency(metrics.totals.prets_total_montant_net)}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                                    <p className="text-xs text-muted-foreground">Accordé {metrics.current_year}</p>
                                                    <p className="text-lg font-bold">{formatCurrency(metrics.totals.prets_entries_current_year)}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                                    <p className="text-xs text-muted-foreground">Mensualité Totale</p>
                                                    <p className="text-lg font-bold">{formatCurrency(metrics.totals.prets_total_monthly_payment)}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{metrics.counts.pret_entries} paiement(s) enregistré(s)</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className={`border-0 shadow-xl ${isPositivePosition ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'}`}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Position Nette</p>
                                                <p className={`text-4xl font-bold mt-2 ${isPositivePosition ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                                    {formatCurrency(Math.abs(netLoansPosition))}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {isPositivePosition ? 'Vous êtes créditeur' : 'Vous êtes débiteur'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Flux {metrics.current_year}</p>
                                                <p className={`text-2xl font-bold mt-1 ${netLoansCurrentYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(Math.abs(netLoansCurrentYear))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </TabsContent>

                    <TabsContent value="balances" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                            <StatCard
                                title="Solde Actuel Total"
                                value={formatCurrency(metrics?.totals.current_month_balances_total || 0)}
                                subtitle={`${metrics?.totals.current_month_balances_count || 0} compte(s) • ${currentMonthName}`}
                                icon={Wallet}
                                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                            />
                            <StatCard
                                title="Historique Complet"
                                value={formatCurrency(metrics?.totals.all_balances_total || 0)}
                                subtitle={`${metrics?.counts.account_balances || 0} entrée(s) totale(s)`}
                                icon={PiggyBank}
                                gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                            />
                            <StatCard
                                title="Comptes Bancaires"
                                value={metrics?.counts.bank_accounts || 0}
                                subtitle={`${metrics?.counts.banks || 0} banque(s)`}
                                icon={CreditCard}
                                gradient="bg-gradient-to-br from-violet-500 to-purple-500"
                            />
                        </div>

                        <Card className="border-0 shadow-xl">
                            <CardHeader>
                                <CardTitle>Historique des Soldes</CardTitle>
                                <CardDescription>Consultez l'évolution de vos comptes bancaires</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AccountBalanceList />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageContainer>
    );
}
