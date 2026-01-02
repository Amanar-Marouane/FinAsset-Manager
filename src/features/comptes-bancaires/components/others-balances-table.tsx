import CustomTable from "@/components/ui/table/custom-table";
import { ROUTES } from "@/constants/routes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";

export default function OthersBalancesTable({
    refreshKey,
    accountCurrency,
    selectedYear,
    years = [],
    onYearChange,
    actions,
}: {
    refreshKey: number;
    accountCurrency: string;
    selectedYear: string | number;
    years?: (string | number)[];
    onYearChange?: (year: string) => void;
    actions?: React.ReactNode;
}) {
    return (
        <div className="space-y-3 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
                <Heading title="Soldes d'autrui" />
                <div className="flex items-center gap-2">
                    <Select value={String(selectedYear)} onValueChange={onYearChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Année" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            {years.map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {actions}
                </div>
            </div>
            <CustomTable
                key={refreshKey}
                columns={[
                    { data: 'date', label: 'Date', sortable: true },
                    {
                        data: 'amount',
                        label: "Montant d'autrui",
                        sortable: true,
                        render: (val: any) =>
                            new Intl.NumberFormat('fr-FR', { style: 'currency', currency: accountCurrency }).format(Number(val ?? 0))
                    },
                ]}
                url={`${ROUTES.othersBalances.index}${selectedYear !== 'all' ? `?year=${selectedYear}` : ''}`}
                pageSizeOptions={[12, 25, 50, 100]}
            />
        </div>
    );
}
