"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccountBalance, BankAccountSchema } from "@/types/bank-types";
import { DollarSign, Edit, History, Minus, MoreVertical, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { OtherPersonMoneyForm } from "./other-person-money-form";

interface AccountsTableProps {
    accounts: BankAccountSchema[];
    year: number;
    onEdit: (account: BankAccountSchema) => void;
    onBalanceManager: (account: BankAccountSchema) => void;
    onQuickBalance: (account: BankAccountSchema) => void;
    onDelete: (account: BankAccountSchema) => void;
    onRefresh?: () => void; // NEW: add refresh callback
}

export const AccountsTable = ({ accounts, year, onEdit, onBalanceManager, onQuickBalance, onDelete, onRefresh }: AccountsTableProps) => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    // Determine display currency for totals/summary rows (fallback to MAD)
    const totalsCurrency = accounts.length > 0 ? accounts[0].currency : 'MAD';

    const getBalanceForMonth = (balances: AccountBalance[], month: number, currency: string): string => {
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

    const [otherPersonMoneyDialogOpen, setOtherPersonMoneyDialogOpen] = useState(false);
    const [selectedAccountForOther, setSelectedAccountForOther] = useState<BankAccountSchema | null>(null);

    // Get other person money from balance data
    const getOtherPersonMoneyForMonth = (balances: AccountBalance[], month: number): number | null => {
        const balance = balances.find(b => b.date === `${year}-${month.toString().padStart(2, '0')}`);
        return balance?.other_person_money ? parseFloat(balance.other_person_money) : null;
    };

    // Remove hard-coded values
    const otherOpening = null;

    // Calculate monthly other person money totals
    const calculateOtherPersonMoneyTotal = (month: number): number | null => {
        let total = 0;
        let hasData = false;
        accounts.forEach(account => {
            const otherMoney = getOtherPersonMoneyForMonth(account.balances, month);
            if (otherMoney !== null) {
                total += otherMoney;
                hasData = true;
            }
        });
        return hasData ? total : null;
    };

    const parseTotal = (totalStr: string): number | null => {
        const parsed = parseFloat(totalStr);
        return isNaN(parsed) ? null : parsed;
    }

    // NEW: compute diff and percentage
    const calcDiff = (totalStr: string, otherVal: number | null | undefined) => {
        const total = parseTotal(totalStr);
        if (total === null) return { total: null, diff: null, pct: null, sign: 0, other: null };
        const other = otherVal ?? 0;
        const diff = total - other;
        const pct = total !== 0 ? (other / total) * 100 : 0; // percentage of “autre personne” vs total
        const sign = diff > 0 ? 1 : diff < 0 ? -1 : 0;
        return { total, diff, pct, sign, other };
    };

    // NEW: small icon helper for diff sign
    const DiffIcon = ({ sign }: { sign: number }) => {
        if (sign > 0) return <TrendingUp className="h-3 w-3 text-green-700" />;
        if (sign < 0) return <TrendingDown className="h-3 w-3 text-red-700" />;
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    };

    // NEW: plain diff (no badge) for “Solde réel”
    const renderDiffCellPlain = (totalStr: string, otherVal: number | null | undefined) => {
        const { diff, sign, total } = calcDiff(totalStr, otherVal);
        if (total === null || diff === null) return <span className={AUTO_TEXT}>—</span>;
        const cls = sign > 0 ? "text-green-700" : sign < 0 ? "text-red-700" : "text-muted-foreground";
        return <span className={`${cls} ${AUTO_TEXT}`}>{diff.toFixed(2)} {totalsCurrency}</span>;
    };

    // UPDATED: percent-only with bg color
    const renderPctCell = (totalStr: string, otherVal: number | null | undefined) => {
        const { pct, total, sign } = calcDiff(totalStr, otherVal);
        if (total === null) return <span className={`block text-center ${AUTO_TEXT}`}>—</span>;
        if (total === 0) return <span className={`block text-center text-muted-foreground ${AUTO_TEXT}`}>#DIV/0!</span>;
        const cls =
            sign > 0
                ? "inline-flex items-center justify-center gap-1 rounded px-2 py-0.5 bg-green-100 text-green-800"
                : sign < 0
                    ? "inline-flex items-center justify-center gap-1 rounded px-2 py-0.5 bg-red-100 text-red-800"
                    : "inline-flex items-center justify-center gap-1 rounded px-2 py-0.5 bg-muted text-muted-foreground";
        return (
            <span className={cls}>
                <DiffIcon sign={sign} />
                {pct!.toFixed(1)}%
            </span>
        );
    };

    // NEW: diff between (total - other) and other, with % of that diff over the previous diff
    const renderResidualDiffCell = (totalStr: string, otherVal: number | null | undefined) => {
        const { total, diff, other } = calcDiff(totalStr, otherVal);
        if (total === null || diff === null || other === null) return <span className={AUTO_TEXT}>—</span>;
        const residual = diff - other;
        const pct = diff !== 0 ? (residual / diff) * 100 : 0;
        const sign = residual > 0 ? 1 : residual < 0 ? -1 : 0;
        const cls =
            sign > 0
                ? "inline-flex items-center gap-1 rounded px-2 py-0.5 bg-green-100 text-green-800"
                : sign < 0
                    ? "inline-flex items-center gap-1 rounded px-2 py-0.5 bg-red-100 text-red-800"
                    : "inline-flex items-center gap-1 rounded px-2 py-0.5 bg-muted text-muted-foreground";
        return (
            <span className={`${cls} ${AUTO_TEXT}`}>
                {residual.toFixed(2)} {totalsCurrency} ({pct.toFixed(1)}%)
            </span>
        );
    };

    // Column width constants for alignment
    const BANK_W = 140;
    const ACC_W = 180;
    const MONTH_W = 100;
    const OPEN_W = 150;
    const TABLE_MIN_W = BANK_W + ACC_W + OPEN_W + MONTH_W * months.length;
    const leftAccountCol = BANK_W;

    const w = (px: number) => ({ width: px, minWidth: px, maxWidth: px });
    const AUTO_TEXT = "text-[clamp(10px,2vw,14px)] leading-tight";

    return (
        <div className="rounded-lg overflow-x-auto w-full flex flex-col items-center justify-center">
            {/* Main table with accounts and totals */}
            <div className="mt-4 rounded-md py-2">
                <Table className="w-max border" style={{ minWidth: TABLE_MIN_W }}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky border left-0 bg-background text-left" style={w(BANK_W)}>BQ</TableHead>
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
                                <TableCell className="border sticky left-0 bg-background font-medium overflow-hidden" style={w(BANK_W)}>
                                    <div className="truncate">
                                        <span className={AUTO_TEXT}>{account.bank?.name || '—'}</span>
                                    </div>
                                </TableCell>
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
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedAccountForOther(account);
                                                    setOtherPersonMoneyDialogOpen(true);
                                                }}>
                                                    <DollarSign className="mr-2 h-4 w-4" />
                                                    <span>Fonds d'autrui</span>
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
                                    <TableCell key={`${account.id}-${month}`} className="border text-right font-mono text-sm overflow-hidden" style={w(MONTH_W)}>
                                        <div className="truncate">
                                            <span className={AUTO_TEXT}>{getBalanceForMonth(account.balances, month, account.currency)}</span>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {/* Totals row with currency */}
                        <TableRow className="bg-muted/50 font-semibold">
                            <TableCell className="sticky left-0 bg-muted/50 box-border border overflow-hidden" style={w(BANK_W)}>
                                <div className="truncate">
                                    <span className={AUTO_TEXT}>Total</span>
                                </div>
                            </TableCell>
                            <TableCell className="border sticky bg-muted/50 overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}></TableCell>
                            <TableCell className="border text-right overflow-hidden" style={w(OPEN_W)}>
                                <div className="truncate">
                                    <span className={AUTO_TEXT}>{calculatePreviousYearTotal()}</span>
                                </div>
                            </TableCell>
                            {months.map((month) => (
                                <TableCell key={`total-${month}`} className="border text-right font-mono overflow-hidden" style={w(MONTH_W)}>
                                    <div className="truncate">
                                        <span className={AUTO_TEXT}>{calculateMonthTotal(month)}</span>
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Argent d'autre personne — full border + currency */}
            <div className="mt-4 rounded-md py-2">
                <Table className="w-max border-none" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky left-0 bg-background font-medium box-border overflow-hidden" style={w(BANK_W)}></TableCell>
                            <TableCell className="sticky bg-background border overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}>
                                <div className="truncate">
                                    <span className={`font-medium ${AUTO_TEXT}`}>Argent d'autre personne</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono border overflow-hidden" style={w(OPEN_W)}></TableCell>
                            {months.map((m) => {
                                const total = calculateOtherPersonMoneyTotal(m);
                                return (
                                    <TableCell key={`other-${m}`} className="text-right font-mono text-sm border overflow-hidden" style={w(MONTH_W)}>
                                        <div className="truncate">
                                            <span className={AUTO_TEXT}>{total !== null ? `${total.toFixed(2)} ${totalsCurrency}` : '—'}</span>
                                        </div>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Solde réel — plain diff (no badge) */}
            <div className="mt-4 rounded-md py-2">
                <Table className="w-max" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky left-0 bg-background font-medium box-border overflow-hidden" style={w(BANK_W)}></TableCell>
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

            {/* NEW: Résiduel (diff between previous diff and people money, with %) */}
            <div className="mt-2">
                <Table className="w-max" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky left-0 bg-transparent overflow-hidden" style={w(BANK_W)}></TableCell>
                            <TableCell className="sticky bg-transparent overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}></TableCell>
                            <TableCell className="overflow-hidden text-center" style={w(OPEN_W)}></TableCell>
                            {months.map((m) => (
                                <TableCell key={`residual-${m}`} className="overflow-hidden text-center" style={w(MONTH_W)}>
                                    {renderResidualDiffCell(calculateMonthTotal(m), calculateOtherPersonMoneyTotal(m))}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Percent-only row — aligned, centered, with bg */}
            <div className="mt-2">
                <Table className="w-max" style={{ minWidth: TABLE_MIN_W, tableLayout: 'fixed' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="sticky left-0 bg-transparent overflow-hidden" style={w(BANK_W)}></TableCell>
                            <TableCell className="sticky bg-transparent overflow-hidden" style={{ ...w(ACC_W), left: leftAccountCol }}></TableCell>
                            <TableCell className="overflow-hidden text-center" style={w(OPEN_W)}></TableCell>
                            {months.map((m) => (
                                <TableCell key={`pct-${m}`} className="overflow-hidden text-center" style={w(MONTH_W)}>
                                    {renderPctCell(calculateMonthTotal(m), calculateOtherPersonMoneyTotal(m))}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Dialog for Other Person Money */}
            <Dialog open={otherPersonMoneyDialogOpen} onOpenChange={setOtherPersonMoneyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Fonds d'autrui - {selectedAccountForOther?.account_name}</DialogTitle>
                    </DialogHeader>
                    {selectedAccountForOther && (
                        <OtherPersonMoneyForm
                            accountId={selectedAccountForOther.id}
                            onSuccess={() => {
                                setOtherPersonMoneyDialogOpen(false);
                                onRefresh?.(); // Trigger parent refresh
                            }}
                            onCancel={() => setOtherPersonMoneyDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};