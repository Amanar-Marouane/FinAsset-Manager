"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { useMemo, useState } from "react";
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

interface BankAccountSchema {
    account_name: string;
    currency: string;
    balances: { date: string; amount: string }[];
}

interface AccountsBalanceChartProps {
    accounts: BankAccountSchema[];
    year: number;
}

const ACCOUNT_COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#10b981', // emerald
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#ef4444', // red
    '#84cc16', // lime
];

export const AccountsBalanceChart = ({ accounts, year }: AccountsBalanceChartProps) => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const [selectedMode, setSelectedMode] = useState<string>("total");

    // Build chart data - ALWAYS include all 12 months
    const allChartData = useMemo(() => monthNames.map((month, index) => {
        const monthNum = (index + 1).toString().padStart(2, '0');
        const dataPoint: any = { month };
        let monthTotal = 0;

        accounts.forEach(account => {
            const balance = account.balances.find(b => b.date === `${year}-${monthNum}`);
            if (balance) {
                const amount = parseFloat(balance.amount);
                dataPoint[account.account_name] = amount;
                monthTotal += amount;
            }
        });

        if (monthTotal > 0) {
            dataPoint['Total'] = monthTotal;
        }

        return dataPoint;
    }), [accounts, year, monthNames]);

    // Use all months (don't filter)
    const chartData = useMemo(() => allChartData, [allChartData]);

    // Options for combobox
    const chartOptions = useMemo(() => [
        { value: 'total', label: 'Total (Linéaire)' },
        { value: 'all', label: 'Tous les comptes' },
        ...accounts.map(acc => ({ value: acc.account_name, label: acc.account_name }))
    ], [accounts]);

    // Determine which accounts to display
    const displayAccounts = useMemo(() => {
        if (selectedMode === 'total') return ['Total'];
        if (selectedMode === 'all') return accounts.map(a => a.account_name);
        return [selectedMode];
    }, [selectedMode, accounts]);

    // Calculate stats
    const stats = useMemo(() => {
        if (selectedMode === 'total') {
            const values = chartData.map(d => d['Total']).filter(v => v !== undefined && v !== null);
            if (values.length === 0) return null;
            const current = values[values.length - 1];
            const first = values[0];
            const change = current - first;
            const changePercent = first !== 0 ? (change / first) * 100 : 0;
            return {
                name: 'Total',
                current,
                change,
                changePercent,
                currency: accounts[0]?.currency || 'MAD'
            };
        }
        if (selectedMode === 'all') return null; // Don't show stats for all mode

        // Single account stats
        const values = chartData.map(d => d[selectedMode]).filter(v => v !== undefined && v !== null);
        if (values.length === 0) return null;
        const current = values[values.length - 1];
        const first = values[0];
        const change = current - first;
        const changePercent = first !== 0 ? (change / first) * 100 : 0;
        const account = accounts.find(a => a.account_name === selectedMode);
        return {
            name: selectedMode,
            current,
            change,
            changePercent,
            currency: account?.currency || 'MAD'
        };
    }, [selectedMode, chartData, accounts]);

    const hasData = chartData.some(d => d['Total'] !== undefined || accounts.some(a => d[a.account_name] !== undefined));
    const currency = accounts[0]?.currency || 'MAD';

    if (!hasData) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Évolution des soldes - {year}</CardTitle>
                    <CardDescription>Aucune donnée disponible pour cette année</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Custom dot with trend color (green/red for total/single mode)
    const CustomDot = (props: any) => {
        const { cx, cy, payload, dataKey, index } = props;
        const currValue = payload[dataKey];
        if (currValue === undefined) return null;

        const prevValue = index > 0 ? chartData[index - 1]?.[dataKey] : undefined;
        const color = prevValue === undefined ? '#3b82f6' : (currValue >= prevValue ? '#22c55e' : '#ef4444');

        return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />;
    };

    // Custom line segments with green/red based on direction (total/single mode only)
    const CustomLine = (props: any) => {
        const { points, dataKey } = props;
        if (!points || points.length < 2) return null;

        return (
            <g>
                {points.map((point: any, index: number) => {
                    if (index === points.length - 1) return null;
                    const nextPoint = points[index + 1];
                    const currentValue = chartData[index]?.[dataKey];
                    const nextValue = chartData[index + 1]?.[dataKey];

                    if (currentValue === undefined || nextValue === undefined) return null;

                    const color = nextValue >= currentValue ? '#22c55e' : '#ef4444';

                    return (
                        <line
                            key={index}
                            x1={point.x}
                            y1={point.y}
                            x2={nextPoint.x}
                            y2={nextPoint.y}
                            stroke={color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />
                    );
                })}
            </g>
        );
    };

    // For "all" mode, use fixed colors per account (no green/red)
    const getAccountColor = (accountName: string, index: number) => {
        return ACCOUNT_COLORS[index % ACCOUNT_COLORS.length];
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <CardTitle className="text-xl font-semibold">Évolution des soldes</CardTitle>
                            <CardDescription className="text-sm mt-1">{year} ({chartData.length} mois)</CardDescription>
                        </div>
                        <Combobox
                            value={selectedMode}
                            onValueChange={(v) => setSelectedMode(v || 'total')}
                            options={chartOptions}
                            placeholder="Sélectionner un mode"
                            searchPlaceholder="Rechercher..."
                            emptyMessage="Aucun compte trouvé"
                            getLabel={(opt) => opt.label}
                            getValue={(opt) => opt.value}
                            className="w-[280px]"
                        />
                    </div>
                    {stats && (
                        <div className="text-right text-xs">
                            <div className="text-muted-foreground">{stats.name}</div>
                            <div className="font-semibold text-lg">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: stats.currency,
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(stats.current)}
                            </div>
                            <div className={stats.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {stats.change >= 0 ? '▲' : '▼'} {Math.abs(stats.changePercent).toFixed(2)}%
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4 overflow-hidden">
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fontWeight: 500 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            orientation="right"
                            tick={{ fontSize: 11, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => {
                                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                                return value.toFixed(0);
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px'
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: '13px' }}
                            formatter={(value: any, name: string | undefined, props: any) => {
                                if (!name || value === undefined) return ['', ''];

                                const index = props.payload ? chartData.indexOf(props.payload) : -1;
                                let changeInfo = '';

                                if (index > 0) {
                                    const prevValue = chartData[index - 1]?.[name];
                                    if (prevValue !== undefined && prevValue !== 0) {
                                        const change = value - prevValue;
                                        const changePercent = ((change / prevValue) * 100);
                                        const changeSymbol = change >= 0 ? '+' : '';
                                        const formattedChange = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency }).format(Math.abs(change));
                                        changeInfo = ` (${changeSymbol}${formattedChange}, ${changeSymbol}${changePercent.toFixed(2)}%)`;
                                    }
                                }
                                return [new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency }).format(value) + changeInfo, name];
                            }}
                        />
                        {selectedMode === 'all' && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />}
                        {selectedMode === 'all' ? (
                            displayAccounts.map((accountName, idx) => (
                                <Line
                                    key={accountName}
                                    type="monotone"
                                    dataKey={accountName}
                                    stroke={getAccountColor(accountName, idx)}
                                    strokeWidth={2}
                                    dot={{ r: 4, strokeWidth: 2, fill: getAccountColor(accountName, idx), stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                    connectNulls={true}
                                />
                            ))
                        ) : (
                            displayAccounts.map((accountName) => (
                                <Line
                                    key={accountName}
                                    type="monotone"
                                    dataKey={accountName}
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
    );
};