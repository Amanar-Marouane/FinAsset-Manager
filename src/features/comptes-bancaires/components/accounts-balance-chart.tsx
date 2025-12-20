"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface BankAccountSchema {
    account_name: string;
    currency: string;
    balances: { date: string; amount: string }[];
}

interface AccountsBalanceChartProps {
    accounts: BankAccountSchema[];
    year: number;
}

export const AccountsBalanceChart = ({ accounts, year }: AccountsBalanceChartProps) => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const [hiddenAccounts, setHiddenAccounts] = useState<Set<string>>(new Set());
    const [selectedAccount, setSelectedAccount] = useState<string>("tous");

    // Build chart data from actual balance data
    const allChartData = monthNames.map((month, index) => {
        const monthNum = (index + 1).toString().padStart(2, '0');
        const dataPoint: any = { month };
        let monthTotal = 0;
        let hasData = false;

        accounts.forEach(account => {
            const balance = account.balances.find(
                b => b.date === `${year}-${monthNum}`
            );
            if (balance) {
                const amount = parseFloat(balance.amount);
                dataPoint[account.account_name] = amount;
                monthTotal += amount;
                hasData = true;
            }
        });

        // Add total for "Tous" option only if month has data
        if (hasData) {
            dataPoint['Total'] = monthTotal;
            dataPoint['_hasData'] = true;
        }

        return dataPoint;
    });

    // Filter chart data based on selection
    let chartData = allChartData.filter(d => d._hasData === true);

    // If a specific account is selected, further filter to only show months with data for that account
    if (selectedAccount !== "tous") {
        chartData = chartData.filter(d => d[selectedAccount] !== undefined);
    }

    // Filter accounts to display based on selection
    const displayAccounts = selectedAccount === "tous" 
        ? [{ account_name: 'Total', currency: accounts[0]?.currency || 'MAD', balances: [] }]
        : accounts.filter(acc => acc.account_name === selectedAccount);

    // Calculate stats - only use months with actual data for selected account
    const stats = displayAccounts.map(account => {
        const dataKey = selectedAccount === "tous" ? 'Total' : account.account_name;
        
        // Get values only for this account from chartData
        const values = chartData
            .map(d => d[dataKey])
            .filter(v => v !== undefined && v !== null);

        if (values.length === 0) return null;

        const current = values[values.length - 1];
        const first = values[0];
        const change = current - first;
        const changePercent = first !== 0 ? (change / first) * 100 : 0;

        return {
            name: dataKey,
            current,
            change,
            changePercent,
            currency: account.currency
        };
    }).filter(Boolean);

    const hasData = chartData.length > 0;

    // Debug logs
    console.log('Chart Debug:', {
        selectedAccount,
        totalMonths: allChartData.length,
        monthsWithData: chartData.length,
        displayAccounts: displayAccounts.map(a => a.account_name),
        chartDataSample: chartData[0],
        hasData,
        stats
    });

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

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
    const currency = accounts[0]?.currency || 'MAD';

    // Toggle account visibility
    const handleLegendClick = (dataKey: string) => {
        setHiddenAccounts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dataKey)) {
                newSet.delete(dataKey);
            } else {
                newSet.add(dataKey);
            }
            return newSet;
        });
    };

    // Custom dot component that changes color based on trend
    const CustomDot = (props: any) => {
        const { cx, cy, payload, dataKey, index } = props;

        const currValue = payload[dataKey];
        if (currValue === undefined) return null;

        // Check if this point has neighbors
        const prevValue = index > 0 ? chartData[index - 1]?.[dataKey] : undefined;
        const nextValue = index < chartData.length - 1 ? chartData[index + 1]?.[dataKey] : undefined;

        // If first point or no previous value
        if (index === 0 || prevValue === undefined) {
            return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" stroke="#fff" strokeWidth={2} />;
        }

        // Color based on trend from previous value
        const color = currValue >= prevValue ? '#22c55e' : '#ef4444';

        return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />;
    };

    // Custom line that changes color based on segment
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

                    // Only draw line if both current and next values exist
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
                            strokeWidth={3}
                            strokeLinecap="round"
                        />
                    );
                })}
            </g>
        );
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <CardTitle className="text-xl font-semibold">Évolution des soldes</CardTitle>
                            <CardDescription className="text-sm mt-1">{year} ({chartData.length} mois avec données)</CardDescription>
                        </div>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Sélectionner un compte" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous (Total)</SelectItem>
                                {accounts.map((account) => (
                                    <SelectItem key={account.account_name} value={account.account_name}>
                                        {account.account_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-4 text-xs">
                        {stats.map((stat, i) => stat && (
                            <div key={i} className="text-right">
                                <div className="text-muted-foreground">{stat.name}</div>
                                <div className="font-semibold text-lg">
                                    {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: stat.currency,
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(stat.current)}
                                </div>
                                <div className={stat.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {stat.change >= 0 ? '▲' : '▼'} {Math.abs(stat.changePercent).toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            {displayAccounts.map((account, idx) => (
                                <linearGradient key={idx} id={`gradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0.05} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fontWeight: 500 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            domain={[0, chartData.length - 1]}
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
                                        const formattedChange = new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: currency
                                        }).format(Math.abs(change));
                                        changeInfo = ` (${changeSymbol}${formattedChange}, ${changeSymbol}${changePercent.toFixed(2)}%)`;
                                    }
                                }

                                return [
                                    new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: currency
                                    }).format(value) + changeInfo,
                                    name
                                ];
                            }}
                        />
                        {selectedAccount === "tous" && (
                            <Legend
                                wrapperStyle={{ 
                                    paddingTop: '20px', 
                                    cursor: 'default',
                                }}
                                iconType="circle"
                            />
                        )}

                        {displayAccounts.map((account, idx) => {
                            const dataKey = selectedAccount === "tous" ? 'Total' : account.account_name;
                            
                            return (
                                <>
                                    <Area
                                        key={`area-${idx}`}
                                        type="monotone"
                                        dataKey={dataKey}
                                        fill={`url(#gradient${idx})`}
                                        stroke="transparent"
                                        strokeWidth={0}
                                        legendType="none"
                                    />
                                    <Line
                                        key={`line-${idx}`}
                                        type="monotone"
                                        dataKey={dataKey}
                                        name={dataKey}
                                        stroke="transparent"
                                        strokeWidth={3}
                                        dot={<CustomDot />}
                                        activeDot={{ r: 7 }}
                                        shape={<CustomLine />}
                                        connectNulls={true}
                                    />
                                </>
                            );
                        })}
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};