"use client"

import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import useApi, { ApiError } from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import { Pret } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, MoreVertical, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { z as zod } from 'zod';

const PRET_COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#10b981', // emerald
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#ef4444', // red
    '#84cc16', // lime
];

const Index2 = () => {
    const [prets, setPrets] = useState<Pret[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [selectedPret, setSelectedPret] = useState<Pret | null>(null);
    const [entryMode, setEntryMode] = useState<'current' | 'custom'>('current');
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedChartPret, setSelectedChartPret] = useState<string>("total");

    const fetchPrets = async (yearParam?: number) => {
        const year = yearParam ?? selectedYear;
        try {
            const response = await trigger<{ data: Pret[] }>(`${ROUTES.prets.all}?year=${year}`);
            setPrets(response.data?.data || []);
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors du chargement des prêts');
        }
    };

    useEffect(() => {
        fetchPrets(currentYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleYearChange = (yearValue: string) => {
        const year = Number(yearValue);
        setSelectedYear(year);
        fetchPrets(year);
    };

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.prets.delete(id), { method: 'delete' });
            showSuccess('Prêt supprimé');
            fetchPrets(selectedYear);
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression');
        }
    };

    const handleEdit = (pret: Pret) => {
        setSelectedPret(pret);
        setEditDialogOpen(true);
    };

    const handleQuickEntry = (pret: Pret, mode: 'current' | 'custom') => {
        setSelectedPret(pret);
        setEntryMode(mode);
        setEntryDialogOpen(true);
    };

    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(v);

    // Chart data - ALWAYS show all 12 months
    const allChartData = useMemo(() => {
        return monthLabels.map((month, idx) => {
            const m = idx + 1;
            const point: any = { month };
            let total = 0;

            prets.forEach(p => {
                const entry = p.entries?.find(e => e.month === m && e.year === selectedYear);
                if (entry) {
                    const amount = Number(entry.amount || 0);
                    point[p.organization || `Prêt ${p.id}`] = amount;
                    total += amount;
                }
            });

            if (total > 0) {
                point['Total'] = total;
            }

            return point;
        });
    }, [prets, selectedYear, monthLabels]);

    const chartData = useMemo(() => {
        // Use all months (don't filter)
        return allChartData;
    }, [allChartData]);

    // Chart options for combobox
    const chartOptions = useMemo(() => [
        { value: 'total', label: 'Total (Linéaire)' },
        { value: 'all', label: 'Tous les prêts' },
        ...prets.map(p => ({ value: p.organization || `Prêt ${p.id}`, label: p.organization || `Prêt ${p.id}` }))
    ], [prets]);

    // Determine which prets to display
    const displayPrets = useMemo(() => {
        if (selectedChartPret === 'total') return ['Total'];
        if (selectedChartPret === 'all') return prets.map(p => p.organization || `Prêt ${p.id}`);
        return [selectedChartPret];
    }, [selectedChartPret, prets]);

    const stats = useMemo(() => {
        if (selectedChartPret === 'all') return null; // Don't show stats for all mode

        const key = selectedChartPret === "total" ? 'Total' : selectedChartPret;
        const values = chartData.map(d => d[key]).filter(v => v !== undefined && v !== null);
        if (!values.length) return null;
        const current = values[values.length - 1];
        const first = values[0];
        const change = current - first;
        const changePercent = first !== 0 ? (change / first) * 100 : 0;
        return { name: key, current, change, changePercent };
    }, [chartData, selectedChartPret]);

    // Custom dot with trend color (for total/single mode)
    const CustomDot = (props: any) => {
        const { cx, cy, payload, dataKey, index } = props;
        const currValue = payload[dataKey];
        if (currValue === undefined) return null;
        const prevValue = index > 0 ? chartData[index - 1]?.[dataKey] : undefined;
        const color = prevValue === undefined ? '#3b82f6' : (currValue >= prevValue ? '#22c55e' : '#ef4444');
        return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />;
    };

    // For "all" mode, use fixed colors per pret
    const getPretColor = (pretName: string, index: number) => {
        return PRET_COLORS[index % PRET_COLORS.length];
    };

    const monthlyTotals = useMemo(() => {
        const totals = Array(12).fill(0);
        let grandTotal = 0;
        let montantTotal = 0;
        let montantNetTotal = 0;

        prets.forEach(p => {
            montantTotal += Number(p.montant || 0);
            montantNetTotal += Number(p.montant_net || 0);
            for (let m = 1; m <= 12; m++) {
                const entry = p.entries?.find(e => e.month === m && e.year === selectedYear);
                totals[m - 1] += Number(entry?.amount || 0);
            }
        });
        grandTotal = totals.reduce((a, b) => a + b, 0);
        return { months: totals, grandTotal, montantTotal, montantNetTotal };
    }, [prets, selectedYear]);

    const getPreviousYearTotal = (pret: Pret) => {
        return Number(pret.entries_total_before_current_year || 0);
    };

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 md:px-6">
                    <Heading title='Vos Prêts' />
                    <div className="flex items-center gap-2">
                        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Année" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <Plus className='h-4 w-4 mr-2' />
                                    Nouveau Prêt
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Ajouter un prêt</DialogTitle>
                                </DialogHeader>
                                <PretForm
                                    onSuccess={() => {
                                        setCreateDialogOpen(false);
                                        fetchPrets(selectedYear);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Separator className='mb-2' />

                <div className="flex flex-1 flex-col space-y-4 px-3 md:px-6">
                    <div className="rounded-md border max-h-[35vh] overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                                <tr className="text-left">
                                    <th className="p-2">Organisation</th>
                                    <th className="p-2">Montant net</th>
                                    <th className="p-2">Montant total</th>
                                    <th className="p-2">Total Ant/Ext</th>
                                    {monthLabels.map((ml, idx) => (
                                        <th key={idx} className="p-2">{ml}</th>
                                    ))}
                                    <th className="p-2">Total</th>
                                    <th className="p-2">Reste</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prets.map((p) => {
                                    const monthValues = Array.from({ length: 12 }, (_, i) => {
                                        const m = i + 1;
                                        const entry = p.entries?.find(e => e.month === m && e.year === selectedYear);
                                        return Number(entry?.amount || 0);
                                    });
                                    const rowTotal = monthValues.reduce((a, b) => a + b, 0);
                                    const previousTotal = getPreviousYearTotal(p);
                                    const pretAmount = Number(p.montant || 0);
                                    const remaining = pretAmount - previousTotal - rowTotal;

                                    return (
                                        <tr key={p.id} className="border-t">
                                            <td className="p-2 flex items-center gap-2">
                                                {p.organization || `Prêt #${p.id}`}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-6 w-6 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(p)}>Modifier</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-red-600">Supprimer</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="p-2">{formatCurrency(Number(p.montant_net || 0))}</td>
                                            <td className="p-2">{formatCurrency(pretAmount)}</td>
                                            <td className="p-2">{previousTotal > 0 ? formatCurrency(previousTotal) : '-'}</td>
                                            {monthValues.map((v, i) => (
                                                <td key={i} className="p-2">{v ? formatCurrency(v) : '-'}</td>
                                            ))}
                                            <td className="p-2">{formatCurrency(rowTotal)}</td>
                                            <td className={`p-2 font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(remaining)}
                                            </td>
                                            <td className="p-2 flex gap-1">
                                                <Button variant="outline" size="sm" onClick={() => handleQuickEntry(p, 'current')}>
                                                    Mois courant
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleQuickEntry(p, 'custom')}>
                                                    <Calendar className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="sticky bottom-0 bg-muted">
                                <tr className="border-t bg-muted/50 font-medium">
                                    <td className="p-2">Total</td>
                                    <td className="p-2">{formatCurrency(monthlyTotals.montantNetTotal)}</td>
                                    <td className="p-2">{formatCurrency(monthlyTotals.montantTotal)}</td>
                                    <td className="p-2">-</td>
                                    {monthlyTotals.months.map((v, i) => (
                                        <td key={i} className="p-2">{v ? formatCurrency(v) : '-'}</td>
                                    ))}
                                    <td className="p-2">{formatCurrency(monthlyTotals.grandTotal)}</td>
                                    <td className="p-2">-</td>
                                    <td className="p-2" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Chart */}
                <div className="px-3 md:px-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-semibold">Statistiques prêts</CardTitle>
                                        <CardDescription className="text-sm mt-1">{selectedYear} (12 mois)</CardDescription>
                                    </div>
                                    <Combobox
                                        value={selectedChartPret}
                                        onValueChange={(v) => setSelectedChartPret(v || 'total')}
                                        options={chartOptions}
                                        placeholder="Sélectionner un mode"
                                        searchPlaceholder="Rechercher..."
                                        emptyMessage="Aucun prêt trouvé"
                                        getLabel={(opt) => opt.label}
                                        getValue={(opt) => opt.value}
                                        className="w-[280px]"
                                    />
                                </div>
                                {stats && (
                                    <div className="text-right text-xs">
                                        <div className="text-muted-foreground">{stats.name}</div>
                                        <div className="font-semibold text-lg">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(stats.current)}
                                        </div>
                                        <div className={stats.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {stats.change >= 0 ? '▲' : '▼'} {Math.abs(stats.changePercent).toFixed(2)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 overflow-hidden">
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#e5e7eb' }} />
                                    <YAxis
                                        orientation="right"
                                        tick={{ fontSize: 11, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => {
                                            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                                            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
                                            return value.toFixed(0);
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px', padding: '12px' }}
                                        labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                                        itemStyle={{ color: '#fff', fontSize: '13px' }}
                                        formatter={(value: any, name: string | undefined, props: any) => {
                                            if (!name || value === undefined) return ['', ''];
                                            const idx = props.payload ? chartData.indexOf(props.payload) : -1;
                                            let changeInfo = '';
                                            if (idx > 0) {
                                                const prev = chartData[idx - 1]?.[name];
                                                if (prev !== undefined && prev !== 0) {
                                                    const change = value - prev;
                                                    const changePercent = ((change / prev) * 100);
                                                    const sign = change >= 0 ? '+' : '';
                                                    const formatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(Math.abs(change));
                                                    changeInfo = ` (${sign}${formatted}, ${sign}${changePercent.toFixed(2)}%)`;
                                                }
                                            }
                                            return [new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value) + changeInfo, name];
                                        }}
                                    />
                                    {selectedChartPret === 'all' && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />}
                                    {selectedChartPret === 'all' ? (
                                        displayPrets.map((pretName, idx) => (
                                            <Line
                                                key={pretName}
                                                type="monotone"
                                                dataKey={pretName}
                                                stroke={getPretColor(pretName, idx)}
                                                strokeWidth={2}
                                                dot={{ r: 4, strokeWidth: 2, fill: getPretColor(pretName, idx), stroke: '#fff' }}
                                                activeDot={{ r: 6 }}
                                                connectNulls={true}
                                            />
                                        ))
                                    ) : (
                                        displayPrets.map((pretName) => (
                                            <Line
                                                key={pretName}
                                                type="monotone"
                                                dataKey={pretName}
                                                stroke="#3b82f6"
                                                strokeWidth={2.5}
                                                dot={<CustomDot />}
                                                activeDot={{ r: 6 }}
                                                connectNulls={true}
                                            />
                                        ))
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* ...existing code dialogs... */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le prêt</DialogTitle>
                        </DialogHeader>
                        {selectedPret ? (
                            <PretForm
                                initialData={selectedPret}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedPret(null);
                                    fetchPrets(selectedYear);
                                }}
                            />
                        ) : <></>}
                    </DialogContent>
                </Dialog>

                <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Ajouter une entrée</DialogTitle>
                        </DialogHeader>
                        {selectedPret ? (
                            <PretEntryForm
                                pret={selectedPret}
                                year={selectedYear}
                                mode={entryMode}
                                onSuccess={() => {
                                    setEntryDialogOpen(false);
                                    fetchPrets(selectedYear);
                                }}
                            />
                        ) : <></>}
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    );
};

const pretSchema = zod.object({
    organization: zod.string().min(1, 'L\'organisation est requise'),
    montant: zod.string().min(1, 'Le montant est requis'),
    montant_net: zod.string().min(1, 'Le montant net est requis'),
    monthly_payment: zod.string().optional(),
});

type PretFormValues = zod.infer<typeof pretSchema>;

const PretForm = ({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Pret }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<PretFormValues>({
        resolver: zodResolver(pretSchema),
        defaultValues: {
            organization: initialData?.organization || '',
            montant: initialData?.montant || '',
            montant_net: initialData?.montant_net || '',
            monthly_payment: initialData?.monthly_payment || '',
        }
    });

    const onSubmit = async (values: PretFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = { ...values };
            if (initialData) {
                await trigger(ROUTES.prets.update(initialData.id), { method: 'put', data: payload });
            } else {
                await trigger(ROUTES.prets.store, { method: 'post', data: payload });
            }
            showSuccess(initialData ? 'Prêt modifié' : 'Prêt ajouté');
            onSuccess();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organisation</FormLabel>
                            <FormControl><Input placeholder="Ex: Entreprise XYZ" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-2">
                    <FormField
                        control={form.control}
                        name="montant_net"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant net</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="montant"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant total</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="monthly_payment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mensualité</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
                </div>
            </form>
        </Form>
    );
};

const pretEntrySchema = zod.object({
    amount: zod.string().min(1, 'Le montant est requis'),
    date: zod.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Date invalide'),
});

type PretEntryFormValues = zod.infer<typeof pretEntrySchema>;

const PretEntryForm = ({
    pret,
    year,
    mode,
    onSuccess,
}: {
    pret: Pret;
    year: number;
    mode: 'current' | 'custom';
    onSuccess: () => void;
}) => {
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();
    const currentMonth = new Date().getMonth() + 1;
    const defaultMonth = String(currentMonth).padStart(2, '0');

    const form = useForm<PretEntryFormValues>({
        resolver: zodResolver(pretEntrySchema),
        defaultValues: {
            amount: pret.monthly_payment || '',
            date: `${year}-${defaultMonth}`,
        }
    });

    const dateStr = form.watch('date');
    const [yrStr, moStr] = (dateStr || `${year}-${defaultMonth}`).split('-');
    const existing = pret.entries?.find(e => e.month === Number(moStr) && e.year === Number(yrStr));

    useEffect(() => {
        if (existing) {
            form.setValue('amount', existing.amount || '');
        } else {
            form.setValue('amount', pret.monthly_payment || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateStr]);

    const onSubmit = async (values: PretEntryFormValues) => {
        try {
            const [yr, mo] = values.date.split('-');
            await trigger(ROUTES.pretEntries.store, {
                method: 'post',
                data: {
                    pret_id: pret.id,
                    amount: Number(values.amount),
                    month: Number(mo),
                    year: Number(yr),
                }
            });
            showSuccess('Entrée enregistrée');
            onSuccess();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {mode === 'custom' && (
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mois & Année</FormLabel>
                                <FormControl>
                                    <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Montant</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit">Enregistrer</Button>
                </div>
            </form>
        </Form>
    );
};

export default Index2;
