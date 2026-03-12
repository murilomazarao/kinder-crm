import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/primitives';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { InvoiceManager } from './InvoiceManager';
import { blingService } from '../lib/blingService';

const KpiCard = ({ title, value, trend, trendValue, positive }: { title: string, value: string, trend: string, trendValue: string, positive: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {positive ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">
                <span className={positive ? "text-green-500" : "text-red-500"}>{trendValue}</span> {trend}
            </p>
        </CardContent>
    </Card>
);

export const FinanceDashboard = () => {
    const { darkMode, invoices, isLoading } = useStore();

    if (isLoading) {
        return (
            <div className="space-y-6 pb-20 animate-pulse">
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-3xl bg-white/5 border border-white/10" />
                    ))}
                </div>
                <div className="h-40 rounded-3xl bg-white/5 border border-white/10" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4 h-[400px] rounded-3xl bg-white/5 border border-white/10" />
                    <div className="col-span-3 h-[400px] rounded-3xl bg-white/5 border border-white/10" />
                </div>
            </div>
        );
    }

    // Calculate totals from real invoices
    const totalRevenue = invoices
        .filter(i => i.type === 'income')
        .reduce((acc, curr) => acc + curr.value, 0);

    const totalExpenses = invoices
        .filter(i => i.type === 'expense')
        .reduce((acc, curr) => acc + curr.value, 0);

    const profit = totalRevenue - totalExpenses;

    // Prepare chart data (group by month)
    const chartDataMap = new Map<string, { month: string, revenue: number, expenses: number }>();

    invoices.forEach(invoice => {
        const date = new Date(invoice.date);
        const monthKey = date.toLocaleString('default', { month: 'short' });

        if (!chartDataMap.has(monthKey)) {
            chartDataMap.set(monthKey, { month: monthKey, revenue: 0, expenses: 0 });
        }

        const entry = chartDataMap.get(monthKey)!;
        if (invoice.type === 'income') {
            entry.revenue += invoice.value;
        } else {
            entry.expenses += invoice.value;
        }
    });

    const chartData = Array.from(chartDataMap.values());

    const [blingAccounts, setBlingAccounts] = React.useState<any[]>([]);
    const [isLoadingBling, setIsLoadingBling] = React.useState(false);

    React.useEffect(() => {
        const loadBlingData = async () => {
            setIsLoadingBling(true);
            try {
                const response = await blingService.fetchBankAccounts();
                console.log("FinanceDashboard: Bling Data received", response);

                // Bling V3 geralmente retorna { data: [...] }
                // Mas vamos ser defensivos caso retorne o array direto
                const accountsData = response.data || (Array.isArray(response) ? response : []);
                setBlingAccounts(accountsData);
            } catch (err) {
                console.error("Erro ao carregar contas do Bling:", err);
            } finally {
                setIsLoadingBling(false);
            }
        };

        loadBlingData();
    }, []);

    return (
        <div className="space-y-6 pb-20">
            <div className="grid gap-4 md:grid-cols-3">
                <KpiCard
                    title="Receita Total"
                    value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    trend="vs. último período"
                    trendValue="--"
                    positive={true}
                />
                <KpiCard
                    title="Despesas"
                    value={totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    trend="vs. último período"
                    trendValue="--"
                    positive={false}
                />
                <KpiCard
                    title="Lucro Líquido"
                    value={profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    trend="Margem"
                    trendValue={`${totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0}%`}
                    positive={profit >= 0}
                />
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="https://www.bling.com.br/vue-src/apps/menu/assets/images/Logo.svg" className="h-6 w-auto brightness-200" alt="Bling" />
                        <h2 className="text-xl font-black text-white">
                            Saldos em Tempo Real
                        </h2>
                    </div>
                    {isLoadingBling && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {blingAccounts.length > 0 ? (
                        blingAccounts.map((account) => (
                            <Card key={account.id} className="bg-black/40 border-white/5 backdrop-blur-3xl overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black uppercase tracking-widest text-primary/60">{account.descricao}</span>
                                        <div className="text-xl font-black text-white">
                                            {Number(account.saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground/60 uppercase font-bold">
                                        <span>Banco: {account.banco || 'Carteira'}</span>
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                </CardContent>
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <ArrowUpRight className="h-8 w-8 text-white" />
                                </div>
                            </Card>
                        ))
                    ) : !isLoadingBling && (
                        <div className="col-span-full p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                            <p className="text-muted-foreground">Conecte o Bling ou autorize o módulo "Caixas e Bancos" para ver seus saldos aqui.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4 bg-black/40 border-white/5 backdrop-blur-3xl">
                    <CardHeader>
                        <CardTitle>Fluxo de Caixa</CardTitle>
                        <p className="text-sm text-muted-foreground">Comparativo de Receita vs Despesa</p>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#333' : '#e5e5e5'} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `R$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: darkMode ? '#18181b' : '#fff', borderColor: darkMode ? '#27272a' : '#e5e5e5', borderRadius: '8px' }}
                                        itemStyle={{ color: darkMode ? '#fff' : '#000' }}
                                        formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    />
                                    <Bar dataKey="revenue" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Manager / Recent Transactions */}
                <Card className="col-span-3 bg-black/40 border-white/5 backdrop-blur-3xl">
                    <CardHeader>
                        <CardTitle>Gerenciamento Financeiro</CardTitle>
                        <p className="text-sm text-muted-foreground">Notas Fiscais e Lançamentos</p>
                    </CardHeader>
                    <CardContent>
                        <InvoiceManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
