"use client"

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccountBalance, BankAccountSchema, OthersBalances } from "@/types/bank-types";
import { DollarSign, Edit, History, Minus, MoreVertical, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";

interface AccountsTableProps {
    accounts: BankAccountSchema[];
    othersBalances: OthersBalances[];
    year: number;
    onEdit: (account: BankAccountSchema) => void;
    onBalanceManager: (account: BankAccountSchema) => void;
    onQuickBalance: (account: BankAccountSchema) => void;
    onDelete: (account: BankAccountSchema) => void;
    onRefresh?: () => void;
    onOpenOthersForm?: (account: BankAccountSchema) => void;
}

export const AccountsTable = ({ accounts, othersBalances, year, onEdit, onBalanceManager, onQuickBalance, onDelete, onRefresh, onOpenOthersForm }: AccountsTableProps) => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    const getBalanceForMonth = (balances: AccountBalance[], month: number): string => {
        const balance = balances.find(b => b.date === `${year}-${month.toString().padStart(2, '0')}`);
        return balance ? `${balance.amount}` : '—';
    };

    const calculateMonthTotal = (month: number): string => {
        const total = accounts.reduce((sum, account) => {
            const balance = (account.balances).find(b => b.date === `${year}-${month.toString().padStart(2, '0')}`);
            if (balance) sum += parseFloat(balance.amount);
            return sum;
        }, 0);
        return total > 0 ? `${total.toFixed(2)}` : '—';
    };

    const calculatePreviousYearTotal = (): string => {
        const total = accounts.reduce((sum, account) => {
            if (account.previous_year_last_balance) sum += parseFloat(account.previous_year_last_balance);
            return sum;
        }, 0);
        return total > 0 ? `${total.toFixed(2)}` : '—';
    };

    const getOtherPersonMoneyForMonth = (month: number): number | null => {
        const balance = othersBalances.find(b => b.date === `${year}-${month.toString().padStart(2, '0')}`);
        return balance ? parseFloat(balance.amount) : null;
    };

    const otherOpening = 0;

    const calculateOtherPersonMoneyTotal = (month: number): number | null => {
        return getOtherPersonMoneyForMonth(month);
    };

    const parseTotal = (totalStr: string): number | null => {
        const parsed = parseFloat(totalStr);
        return isNaN(parsed) ? null : parsed;
    }

    const calcDiff = (totalStr: string, otherVal: number | null | undefined) => {
        const total = parseTotal(totalStr);
        if (total === null) return { total: null, diff: null, pct: null, sign: 0, other: null };
        const other = otherVal ?? 0;
        const diff = total - other;
        const pct = total !== 0 ? (diff / total) * 100 : 0;
        const sign = diff > 0 ? 1 : diff < 0 ? -1 : 0;
        return { total, diff, pct, sign, other };
    };

    const DiffIcon = ({ sign }: { sign: number }) => {
        if (sign > 0) return <TrendingUp className="h-3 w-3 text-green-700" />;
        if (sign < 0) return <TrendingDown className="h-3 w-3 text-red-700" />;
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    };

    const renderDiffCellPlain = (totalStr: string, otherVal: number | null | undefined) => {
        const total = parseTotal(totalStr);
        const other = otherVal ?? 0;

        if ((total === null || total === 0) && other !== 0) {
            return <span className="text-red-700 text-[clamp(10px,2vw,14px)] leading-tight">-{other.toFixed(2)}</span>;
        }

        if (total === null) return <span className={AUTO_TEXT}>—</span>;

        const diff = total - other;
        const sign = diff > 0 ? 1 : diff < 0 ? -1 : 0;
        const cls = sign > 0 ? "text-green-700" : sign < 0 ? "text-red-700" : "text-muted-foreground";
        return <span className={`${cls} ${AUTO_TEXT}`}>{diff.toFixed(2)}</span>;
    };

    const ACC_W = 250;
    const MONTH_W = 100;
    const OPEN_W = 150;
    const TABLE_MIN_W = ACC_W + OPEN_W + MONTH_W * months.length;
    const leftAccountCol = 0;

    const w = (px: number) => ({ width: px, minWidth: px, maxWidth: px });
    const AUTO_TEXT = "text-[clamp(10px,2vw,14px)] leading-tight";

    // Get actual opening balance for other person money from previous year
    const openingOtherBalance = (() => {
        const balance = othersBalances.length > 0 ? othersBalances[0] : null;

        return balance
            ? parseFloat(balance.previous_year_last_balance ?? '0')
            : 0;
    })();

    // Opening real balance = Total opening - Other opening
    const openingTotal = parseTotal(calculatePreviousYearTotal()) ?? 0;
    const openingRealBalance = openingTotal - openingOtherBalance;

    // Real values (Total - Other) for each month
    const realBalances = months.map((m) => {
        const total = parseTotal(calculateMonthTotal(m)) ?? 0;
        const other = calculateOtherPersonMoneyTotal(m) ?? 0;
        return total - other;
    });

    // MoM movements: current - previous
    const realMovements = realBalances.map((val, idx) => {
        const prev = idx === 0 ? openingRealBalance : realBalances[idx - 1];
        return val - prev;
    });

    // Percentage change: (current - previous) / previous
    // Following accounting standard: NOT using abs(previous)
    // Returns null if current is 0/null OR if movement is 0
    const realMovementPct = realMovements.map((delta, idx) => {
        const current = realBalances[idx];
        const prev = idx === 0 ? openingRealBalance : realBalances[idx - 1];

        // If current is 0 or null, return null (no percentage to show)
        if (current === 0 || current === null) return null;

        // If previous is 0 or null but current has value, show 100%
        if (prev === 0 || prev === null) return 100;

        // If delta is 0, return null (no meaningful change)
        if (delta === 0) return null;

        // Standard formula: (current - previous) / previous
        return (delta / prev) * 100;
    });

    // MoM movements: only show if current has value
    const realMovementsFiltered = realMovements.map((delta, idx) => {
        const current = realBalances[idx];
        // Don't show delta if current is 0 or null
        if (current === 0 || current === null) return null;
        return delta;
    });

    const formatDelta = (delta: number | null) => {
        if (delta === null) return <span className={AUTO_TEXT}>—</span>;
        const cls = delta > 0 ? "text-green-700" : delta < 0 ? "text-red-700" : "text-muted-foreground";
        const sign = delta > 0 ? "+" : "";
        return <span className={`${cls} ${AUTO_TEXT}`}>{sign}{delta.toFixed(2)}</span>;
    };

    const formatPctChange = (pct: number | null) => {
        if (pct === null) return <span className={AUTO_TEXT}>—</span>;

        const sign = pct > 0 ? 1 : pct < 0 ? -1 : 0;
        const cls =
            sign > 0 ? "inline-flex items-center gap-1 rounded px-2 py-0.5 bg-green-100 text-green-800" :
                sign < 0 ? "inline-flex items-center gap-1 rounded px-2 py-0.5 bg-red-100 text-red-800" :
                    "inline-flex items-center gap-1 rounded px-2 py-0.5 bg-muted text-muted-foreground";
        const signChar = pct > 0 ? "+" : "";
        return (
            <span className={`${cls} ${AUTO_TEXT}`}>
                <DiffIcon sign={sign} />
                {signChar}{pct.toFixed(1)}%
            </span>
        );
    };

    return (
        <div className="rounded-lg overflow-x-auto w-full flex flex-col items-center justify-center">
            <div className="mt-4 rounded-md py-2">
                <Table className="w-max border" style={{ minWidth: TABLE_MIN_W }}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky border bg-background text-left" style={{ ...w(ACC_W), left: leftAccountCol }}>Compte</TableHead>
                            <TableHead className="border text-right" style={w(OPEN_W)}>Solde d'ouverture</TableHead>
                            {months.map((month) => (
                                <TableHead key={month} className="border text-right" style={w(MONTH_W)}>
                                    {monthNames[month - 1]}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell className="border sticky bg-background overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className={`cursor-help underline truncate flex-1 ${AUTO_TEXT}`}>
                                                    {account.account_name || '—'}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className={AUTO_TEXT}>{account.account_number || '—'}</TooltipContent>
                                        </Tooltip>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuItem onClick={() => onEdit(account)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Modifier</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onBalanceManager(account)}>
                                                    <History className="mr-2 h-4 w-4" />
                                                    <span>Historique & Soldes</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onQuickBalance(account)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    <span>Solde rapide</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onDelete(account)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Supprimer</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                                <TableCell className="border text-right overflow-hidden" style={w(OPEN_W)}>
                                    <div className="truncate">
                                        <span className={AUTO_TEXT}>{account.previous_year_last_balance ? `${account.previous_year_last_balance} ${account.currency}` : '—'}</span>
                                    </div>
                                </TableCell>
                                {months.map((month) => (
                                    <TableCell key={`${account.id}-${month}`} className="border text-right text-sm overflow-hidden" style={w(MONTH_W)}>
                                        <div className="truncate">
                                            <span className={AUTO_TEXT}>{getBalanceForMonth(account.balances, month)}</span>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-semibold">
                            <TableCell className="border sticky bg-muted/50 overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}>
                                <div className="truncate">
                                    <span className={AUTO_TEXT}>Total</span>
                                </div>
                            </TableCell>
                            <TableCell className="border text-right overflow-hidden" style={w(OPEN_W)}>
                                <div className="truncate">
                                    <span className={AUTO_TEXT}>{calculatePreviousYearTotal()}</span>
                                </div>
                            </TableCell>
                            {months.map((month) => (
                                <TableCell key={`total-${month}`} className="border text-right overflow-hidden" style={w(MONTH_W)}>
                                    <div className="truncate">
                                        <span className={AUTO_TEXT}>{calculateMonthTotal(month)}</span>
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 rounded-md py-2">
                <Table className="w-max border-none" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky bg-background border overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}>
                                <div className="flex items-center justify-between truncate">
                                    <span className={`font-medium ${AUTO_TEXT}`}>Argent d'autre personne</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2"
                                        onClick={() => {
                                            const firstAccount = accounts[0];
                                            if (!firstAccount) return;
                                            onOpenOthersForm?.(firstAccount);
                                        }}
                                    >
                                        <DollarSign className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-right border overflow-hidden" style={w(OPEN_W)}>{openingOtherBalance}</TableCell>
                            {months.map((m) => {
                                const total = calculateOtherPersonMoneyTotal(m);
                                return (
                                    <TableCell key={`other-${m}`} className="text-right text-sm border overflow-hidden" style={w(MONTH_W)}>
                                        <div className="truncate">
                                            <span className={AUTO_TEXT}>{total !== null ? `${total.toFixed(2)}` : '—'}</span>
                                        </div>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 rounded-md py-2">
                <Table className="w-max" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky bg-background border overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}>
                                <div className="truncate">
                                    <span className={`font-medium ${AUTO_TEXT}`}>Solde réel</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right border overflow-hidden" style={w(OPEN_W)}>
                                <div className="truncate">
                                    {renderDiffCellPlain(calculatePreviousYearTotal(), otherOpening)}
                                </div>
                            </TableCell>
                            {months.map((m) => (
                                <TableCell key={`real-${m}`} className="text-right border overflow-hidden" style={w(MONTH_W)}>
                                    <div className="truncate">
                                        {renderDiffCellPlain(calculateMonthTotal(m), calculateOtherPersonMoneyTotal(m))}
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div className="mt-2">
                <Table className="w-max" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky bg-transparent overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}></TableCell>
                            <TableCell className="overflow-hidden text-right" style={w(OPEN_W)}></TableCell>
                            {months.map((m, idx) => (
                                <TableCell key={`delta-${m}`} className="overflow-hidden text-right" style={w(MONTH_W)}>
                                    {formatDelta(realMovementsFiltered[idx])}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Row: Percentage change (delta / previous * 100) */}
            <div className="mt-2">
                <Table className="w-max" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky bg-transparent overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}></TableCell>
                            <TableCell className="overflow-hidden text-right" style={w(OPEN_W)}></TableCell>
                            {months.map((m, idx) => (
                                <TableCell key={`pct-${m}`} className="overflow-hidden text-right" style={w(MONTH_W)}>
                                    {formatPctChange(realMovementPct[idx])}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};