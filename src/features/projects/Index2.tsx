"use client"

import PageContainer from "@/components/layout/page-container";
import DeleteModal from "@/components/modal/delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import useApi, { ApiError } from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import { Project } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Edit, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { z as zod } from 'zod';

const Index2 = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedChartProject, setSelectedChartProject] = useState<string>("tous");
    const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
    const [projectsCache, setProjectsCache] = useState<Record<number, Project[]>>({});
    const [yearRangeStart, setYearRangeStart] = useState<number>(currentYear - 2);
    const [yearRangeEnd, setYearRangeEnd] = useState<number>(currentYear);
    const [showPolarChart, setShowPolarChart] = useState(false);

    const fetchProjects = async (yearParam?: number) => {
        const year = yearParam ?? selectedYear;

        // Check cache first
        if (projectsCache[year]) {
            setProjects(projectsCache[year]);
            return;
        }

        try {
            const response = await trigger<{ data: Project[] }>(ROUTES.projects.byYearAndType, {
                data: { year }
            });
            const data = response.data?.data || [];
            setProjects(data);
            setProjectsCache(prev => ({ ...prev, [year]: data }));
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors du chargement des projets');
        }
    };

    // Add function to refresh and invalidate cache
    const refreshProjects = async (yearParam?: number) => {
        const year = yearParam ?? selectedYear;

        try {
            const response = await trigger<{ data: Project[] }>(ROUTES.projects.byYearAndType, {
                data: { year }
            });
            const data = response.data?.data || [];
            setProjects(data);
            // Update cache
            setProjectsCache(prev => ({ ...prev, [year]: data }));
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors du chargement des projets');
        }
    };

    // Fetch projects for year range
    const fetchYearRange = async (startYear: number, endYear: number) => {
        const yearsToFetch: number[] = [];
        for (let y = startYear; y <= endYear; y++) {
            if (!projectsCache[y]) {
                yearsToFetch.push(y);
            }
        }

        if (yearsToFetch.length === 0) return;

        try {
            const promises = yearsToFetch.map(year =>
                trigger<{ data: Project[] }>(ROUTES.projects.byYearAndType, {
                    data: { year }
                })
            );
            const results = await Promise.all(promises);

            const newCache = { ...projectsCache };
            results.forEach((response, idx) => {
                const year = yearsToFetch[idx];
                newCache[year] = response.data?.data || [];
            });
            setProjectsCache(newCache);
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors du chargement des projets');
        }
    };

    useEffect(() => {
        fetchProjects(currentYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchYearRange(yearRangeStart, yearRangeEnd);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearRangeStart, yearRangeEnd]);

    const handleYearChange = (yearValue: string) => {
        const year = Number(yearValue);
        setSelectedYear(year);
        fetchProjects(year);
    };

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.projects.delete(id), { method: 'delete' });
            showSuccess('Projet supprimé');
            await refreshProjects(selectedYear);
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression du projet');
        }
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setEditDialogOpen(true);
    };

    const monthLabels = useMemo(() => {
        // Simple FR labels
        return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    }, []);

    const previousYearEntryValue = (project: Project) => {
        let value = 0;
        project.entries?.forEach(entry => {
            if (entry.previous_year_last_entry !== null) {
                value = Number(entry.previous_year_last_entry);
            }
            return value;
        });
        return value;
    };

    // added: format percentage safely
    const formatPercentage = (total: number, capital: number) => {
        if (!capital || capital === 0) return '—';
        const percent = (total / capital) * 100;
        return `${percent.toFixed(2)}%`;
    };

    const monthlyTotals = useMemo(() => {
        const totals = Array(12).fill(0);
        let capitalTotal = 0;
        let previousYearTotal = 0;
        projects.forEach(p => {
            capitalTotal += Number(p.capital || 0);
            previousYearTotal += Number(previousYearEntryValue(p));
            for (let m = 1; m <= 12; m++) {
                const entry = p.entries?.find(e => Number(e.month) === m && Number(e.year) === selectedYear);
                totals[m - 1] += Number(entry?.amount || 0);
            }
        });
        return { months: totals, capitalTotal, previousYearTotal, grandTotal: totals.reduce((a, b) => a + b, 0) };
    }, [projects, selectedYear]);

    // added: chart data from projects' entries - ALWAYS show all 12 months
    const allChartData = useMemo(() => {
        return monthLabels.map((month, idx) => {
            const m = idx + 1;
            const point: any = { month };
            let total = 0;

            projects.forEach(p => {
                const entry = p.entries?.find(e => Number(e.month) === m && Number(e.year) === selectedYear);
                if (entry) {
                    const amount = Number(entry.amount || 0);
                    point[p.name] = amount;
                    total += amount;
                }
            });

            if (total > 0) {
                point['Total'] = total;
            }

            return point;
        });
    }, [projects, selectedYear, monthLabels]);

    const chartData = useMemo(() => {
        // Use all months (don't filter)
        return allChartData;
    }, [allChartData]);

    const stats = useMemo(() => {
        const key = selectedChartProject === "tous" ? 'Total' : selectedChartProject;
        const values = chartData.map(d => d[key]).filter(v => v !== undefined && v !== null);
        if (!values.length) return null;
        const current = values[values.length - 1];
        const first = values[0];
        const change = current - first;
        const changePercent = first !== 0 ? (change / first) * 100 : 0;
        return { name: key, current, change, changePercent };
    }, [chartData, selectedChartProject]);

    // added: custom dot/line like accounts chart
    const CustomDot = (props: any) => {
        const { cx, cy, payload, dataKey, index } = props;
        const currValue = payload[dataKey];
        if (currValue === undefined) return null;
        const prevValue = index > 0 ? chartData[index - 1]?.[dataKey] : undefined;
        const color = prevValue === undefined ? '#3b82f6' : (currValue >= prevValue ? '#22c55e' : '#ef4444');
        return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />;
    };

    const CustomLine = (props: any) => {
        const { points, dataKey } = props;
        if (!points || points.length < 2) return null;
        return (
            <g>
                {points.map((pt: any, i: number) => {
                    if (i === points.length - 1) return null;
                    const nextPt = points[i + 1];
                    const v1 = chartData[i]?.[dataKey];
                    const v2 = chartData[i + 1]?.[dataKey];
                    if (v1 === undefined || v2 === undefined) return null;
                    const color = v2 >= v1 ? '#22c55e' : '#ef4444';
                    return (
                        <line
                            key={i}
                            x1={pt.x}
                            y1={pt.y}
                            x2={nextPt.x}
                            y2={nextPt.y}
                            stroke={color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />
                    );
                })}
            </g>
        );
    };

    // Yearly revenue chart data
    const yearlyRevenueData = useMemo(() => {
        const data = monthLabels.map((month, idx) => {
            const m = idx + 1;
            const point: any = { month };

            for (let year = yearRangeStart; year <= yearRangeEnd; year++) {
                const yearProjects = projectsCache[year] || [];
                let yearMonthTotal = 0;

                yearProjects.forEach(p => {
                    const entry = p.entries?.find(e => Number(e.month) === m && Number(e.year) === year);
                    yearMonthTotal += Number(entry?.amount || 0);
                });

                point[`${year}`] = yearMonthTotal;
            }

            return point;
        });

        return data;
    }, [projectsCache, yearRangeStart, yearRangeEnd, monthLabels]);

    const yearlyStats = useMemo(() => {
        const stats: Record<string, { total: number; avg: number }> = {};

        for (let year = yearRangeStart; year <= yearRangeEnd; year++) {
            const values = yearlyRevenueData.map(d => d[`${year}`] || 0);
            const total = values.reduce((a, b) => a + b, 0);
            const avg = total / 12;
            stats[year] = { total, avg };
        }

        return stats;
    }, [yearlyRevenueData, yearRangeStart, yearRangeEnd]);

    return (
        <PageContainer scrollable={true}>
            <div className="w-full h-full flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 md:px-6">
                    <Heading title='Vos Projets' />
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
                                    Nouveau Projet
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Ajouter un projet</DialogTitle>
                                </DialogHeader>
                                <ProjectForm
                                    onSuccess={async () => {
                                        setCreateDialogOpen(false);
                                        await refreshProjects(selectedYear);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                        {/* add: expense dialog trigger */}
                        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <DollarSign className='h-4 w-4 mr-2' />
                                    Ajouter dépense
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Ajouter une dépense mensuelle</DialogTitle>
                                </DialogHeader>
                                <ExpenseForm
                                    projects={projects}
                                    year={selectedYear}
                                    onSuccess={async () => {
                                        setExpenseDialogOpen(false);
                                        await refreshProjects(selectedYear);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Separator className='mb-2' />

                <div className="flex-1 flex flex-col space-y-4 px-3 md:px-6 min-h-0">
                    {/* table: constrain to 25vh */}
                    <div className="rounded-md border h-[25vh] overflow-auto flex-shrink-0">
                        <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                                <tr className="text-left">
                                    <th className="p-2">Projet</th>
                                    <th className="p-2">Capital</th>
                                    <th className="p-2">Valuer d'overture</th>
                                    {monthLabels.map((ml, idx) => (
                                        <th key={idx} className="p-2">{ml}</th>
                                    ))}
                                    <th className="p-2">Total</th>
                                    <th className="p-2">PROF/CAP</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((p) => {
                                    const capital = Number(p.capital || 0);
                                    const monthValues = Array.from({ length: 12 }, (_, i) => {
                                        const m = i + 1;
                                        const entry = p.entries?.find(e => Number(e.month) === m && Number(e.year) === selectedYear);
                                        return Number(entry?.amount || 0);
                                    });
                                    const rowTotal = monthValues.reduce((a, b) => a + b, 0);
                                    return (
                                        <tr key={p.id} className="border-t">
                                            <td className="p-2">{p.name}</td>
                                            <td className="p-2">{capital}</td>
                                            <td className="p-2">{previousYearEntryValue(p)}</td>
                                            {monthValues.map((v, i) => (
                                                <td key={i} className="p-2">{v ? v : '-'}</td>
                                            ))}
                                            <td className="p-2">{rowTotal}</td>
                                            <td className="p-2">{formatPercentage(rowTotal, capital)}</td>
                                            <td className="p-2">
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" className="h-8 w-8 p-1.5" onClick={() => handleEdit(p)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteModal
                                                        id={p.id}
                                                        itemName="Projet"
                                                        onDelete={() => handleDelete(p.id)}
                                                        reference={p.name}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="sticky bottom-0 bg-muted">
                                <tr className="border-t bg-muted/50 font-medium">
                                    <td className="p-2">Total</td>
                                    <td className="p-2">{monthlyTotals.capitalTotal}</td>
                                    <td className="p-2">{monthlyTotals.previousYearTotal}</td>
                                    {monthlyTotals.months.map((v, i) => (
                                        <td key={i} className="p-2">{v ? v : '-'}</td>
                                    ))}
                                    <td className="p-2">{monthlyTotals.grandTotal}</td>
                                    <td className="p-2">{formatPercentage(monthlyTotals.grandTotal, monthlyTotals.capitalTotal)}</td>
                                    <td className="p-2" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* stats chart: constrain height */}

                    <Tabs defaultValue="monthly" className="h-full flex flex-col">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="monthly">Statistiques Mensuelles</TabsTrigger>
                            <TabsTrigger value="yearly">Revenus Annuels</TabsTrigger>
                        </TabsList>
                        <TabsContent value="monthly" className="flex-1 min-h-0">
                            <div className="flex-shrink-0">
                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-semibold">Statistiques projets</CardTitle>
                                                <CardDescription className="text-sm mt-1">{selectedYear} (12 mois)</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Select value={selectedChartProject} onValueChange={setSelectedChartProject}>
                                                    <SelectTrigger className="w-[220px]">
                                                        <SelectValue placeholder="Sélectionner un projet" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="tous">Tous (Total)</SelectItem>
                                                        {projects.map((p) => (
                                                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 overflow-hidden">
                                        <ResponsiveContainer width="100%" height={250}>
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
                                                <Line
                                                    type="monotone"
                                                    dataKey={selectedChartProject === 'tous' ? 'Total' : selectedChartProject}
                                                    stroke="#3b82f6"
                                                    strokeWidth={2.5}
                                                    dot={<CustomDot />}
                                                    activeDot={{ r: 6 }}
                                                    connectNulls={true}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="yearly" className="flex-1 min-h-0">
                            {/* New: Yearly revenue chart - constrain height */}
                            <div className="flex-shrink-0 pb-4">
                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-semibold">Revenus annuels comparés</CardTitle>
                                                <CardDescription className="text-sm mt-1">
                                                    Évolution mensuelle par année
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select value={yearRangeStart.toString()} onValueChange={(v) => setYearRangeStart(Number(v))}>
                                                    <SelectTrigger className="w-[100px]">
                                                        <SelectValue placeholder="Début" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map((y) => (
                                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-sm text-muted-foreground">à</span>
                                                <Select value={yearRangeEnd.toString()} onValueChange={(v) => setYearRangeEnd(Number(v))}>
                                                    <SelectTrigger className="w-[100px]">
                                                        <SelectValue placeholder="Fin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map((y) => (
                                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant={showPolarChart ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setShowPolarChart(!showPolarChart)}
                                                >
                                                    {showPolarChart ? "Ligne" : "Polaire"}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-4">
                                            {Object.entries(yearlyStats).map(([year, stats]) => (
                                                <div key={year} className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">{year}</span>
                                                    <span className="text-lg font-semibold">
                                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(stats.total)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Moy: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(stats.avg)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        {showPolarChart ? (
                                            <ResponsiveContainer width="100%" height={350}>
                                                <RadarChart data={yearlyRevenueData}>
                                                    <PolarGrid stroke="#e5e7eb" />
                                                    <PolarAngleAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 500 }} />
                                                    <PolarRadiusAxis
                                                        angle={90}
                                                        tick={{ fontSize: 10 }}
                                                        tickFormatter={(value) => {
                                                            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                                                            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
                                                            return value.toFixed(0);
                                                        }}
                                                    />
                                                    {Array.from({ length: yearRangeEnd - yearRangeStart + 1 }, (_, i) => {
                                                        const year = yearRangeStart + i;
                                                        const colors = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
                                                        return (
                                                            <Radar
                                                                key={year}
                                                                name={`${year}`}
                                                                dataKey={`${year}`}
                                                                stroke={colors[i % colors.length]}
                                                                fill={colors[i % colors.length]}
                                                                fillOpacity={0.2}
                                                                strokeWidth={2}
                                                            />
                                                        );
                                                    })}
                                                    <Legend
                                                        wrapperStyle={{ paddingTop: '20px' }}
                                                        iconType="circle"
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px', padding: '12px' }}
                                                        labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                                                        itemStyle={{ color: '#fff', fontSize: '13px' }}
                                                        formatter={(value: any) =>
                                                            new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value)
                                                        }
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={350}>
                                                <BarChart data={yearlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                                        formatter={(value: any) =>
                                                            new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value)
                                                        }
                                                    />
                                                    <Legend
                                                        wrapperStyle={{ paddingTop: '20px' }}
                                                        iconType="square"
                                                    />
                                                    {Array.from({ length: yearRangeEnd - yearRangeStart + 1 }, (_, i) => {
                                                        const year = yearRangeStart + i;
                                                        const colors = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
                                                        return (
                                                            <Bar
                                                                key={year}
                                                                dataKey={`${year}`}
                                                                fill={colors[i % colors.length]}
                                                                radius={[4, 4, 0, 0]}
                                                                name={`${year}`}
                                                            />
                                                        );
                                                    })}
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le projet</DialogTitle>
                        </DialogHeader>
                        {selectedProject ? (
                            <ProjectForm
                                initialData={selectedProject}
                                onSuccess={async () => {
                                    setEditDialogOpen(false);
                                    setSelectedProject(null);
                                    await refreshProjects(selectedYear);
                                }}
                            />
                        ) : <></>}
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    );
};

const projectSchema = zod.object({
    name: zod.string().min(1, 'Le nom est requis'),
    capital: zod.string().min(1, 'Le capital est requis'),
});

type ProjectFormValues = zod.infer<typeof projectSchema>;

const ProjectForm = ({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Project }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: initialData?.name || '',
            capital: initialData?.capital || '',
        }
    });

    const onSubmit = async (values: ProjectFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: values.name,
                capital: values.capital,
            };

            if (initialData) {
                await trigger(ROUTES.projects.update(initialData.id), { method: 'put', data: payload });
            } else {
                await trigger(ROUTES.projects.store, { method: 'post', data: payload });
            }

            showSuccess(initialData ? 'Projet modifié' : 'Projet ajouté');
            onSuccess();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl><Input placeholder="Ex: Projet Immobilier" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                    <FormField
                        control={form.control}
                        name="capital"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capital</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
                </div>
            </form>
        </Form>
    );
};

// add: expense schema/types
const expenseSchema = zod.object({
    project_id: zod.string().min(1, 'Le projet est requis'),
    amount: zod.string().min(1, 'Le montant est requis').refine(v => Number(v) >= 0, 'Le montant doit être ≥ 0'),
    date: zod.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Date invalide (AAAA-MM)'),
});
type ExpenseFormValues = zod.infer<typeof expenseSchema>;

// add: expense form component
const ExpenseForm = ({
    projects,
    year,
    onSuccess,
}: {
    projects: Project[];
    year: number;
    onSuccess: () => void;
}) => {
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const currentMonth = new Date().getMonth() + 1;
    const defaultMonth = String(currentMonth).padStart(2, '0');

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            project_id: projects[0]?.id?.toString() || '',
            amount: '',
            date: `${year}-${defaultMonth}`,
        }
    });

    // keep date in sync with header-selected year (preserve chosen month)
    useEffect(() => {
        const curr = form.getValues('date') || `${year}-${defaultMonth}`;
        const monthPart = curr.split('-')[1] || defaultMonth;
        form.setValue('date', `${year}-${monthPart}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    // prefill amount if entry exists for selected project + date (month-year)
    const projectId = form.watch('project_id');
    const dateStr = form.watch('date');

    useEffect(() => {
        const pid = Number(projectId);
        const [yrStr, moStr] = (dateStr || `${year}-${defaultMonth}`).split('-');
        const monthNum = Number(moStr);
        const yearNum = Number(yrStr);
        if (!pid || !monthNum || !yearNum) return;

        const proj = projects.find(p => p.id === pid);
        const existing = proj?.entries?.find(e => Number(e.month) === monthNum && Number(e.year) === yearNum);
        if (existing) {
            form.setValue('amount', existing.amount || '');
        } else {
            form.setValue('amount', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, dateStr, projects]);

    const onSubmit = async (values: ExpenseFormValues) => {
        try {
            const [yrStr, moStr] = values.date.split('-');
            await trigger(ROUTES.projectEntries.store, {
                method: 'post',
                data: {
                    project_id: Number(values.project_id),
                    amount: Number(values.amount),
                    month: Number(moStr),
                    year: Number(yrStr),
                }
            });
            showSuccess('Dépense enregistrée');
            onSuccess();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de l\'enregistrement de la dépense');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Projet</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un projet" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
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
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit">Enregistrer</Button>
                </div>
            </form>
        </Form>
    );
};

export default Index2;
