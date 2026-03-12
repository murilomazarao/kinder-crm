import React from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Badge, cn } from './ui/primitives';
import { Users, Package, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
    const { customers, products, columns, isLoading } = useStore();

    if (isLoading) {
        return (
            <div className="space-y-10 animate-pulse">
                <header className="flex flex-col gap-2">
                    <div className="h-10 w-64 bg-white/5 rounded-2xl" />
                    <div className="h-4 w-48 bg-white/5 rounded-lg" />
                </header>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 rounded-[2.5rem] bg-white/5 border border-white/10" />
                    ))}
                </div>
                <div className="grid gap-8 lg:grid-cols-7">
                    <div className="lg:col-span-4 h-[400px] rounded-[2.5rem] bg-white/5 border border-white/10" />
                    <div className="lg:col-span-3 h-[400px] rounded-[2.5rem] bg-white/5 border border-white/10" />
                </div>
            </div>
        );
    }

    // Kanban Metrics
    const leadsByStage = columns.map(col => ({
        id: col.id,
        title: col.title,
        count: customers.filter(c => c.status === col.id).length,
        color: col.color
    }));

    // Pipeline Metrics
    const totalLeads = customers.length;
    const newLeadsCount = customers.filter(c => c.status === 'inbox' || c.status === 'contacted').length;
    const negotiationCount = customers.filter(c => c.status === 'proposal').length;
    const closedCount = customers.filter(c => c.status === 'sale' || c.status === 'delivered').length;

    // Financial Metrics
    const potentialValue = customers
        .filter(c => c.status !== 'sale' && c.status !== 'delivered')
        .reduce((acc, c) => acc + (c.value || 0), 0);

    const closedValue = customers
        .filter(c => c.status === 'sale' || c.status === 'delivered')
        .reduce((acc, c) => acc + (c.value || 0), 0);

    const recentLeads = [...customers]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-10">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">Bem-vindo, <span className="text-primary">Admin</span></h2>
                <p className="text-muted-foreground font-medium">Aqui está o resumo da sua operação hoje.</p>
            </header>

            {/* Top Cards Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="group relative rounded-[2.5rem] bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 p-8 border border-cyan-500/20 shadow-cyan-500/10 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-3 rounded-2xl bg-cyan-500 text-white shadow-cyan-500/30 shadow-lg group-hover:rotate-12 transition-transform">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60">Novos Leads</span>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="text-4xl font-black text-foreground">{newLeadsCount}</div>
                        <p className="text-xs text-muted-foreground font-medium">Aguardando seu primeiro contato</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group relative rounded-[2.5rem] bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-8 border border-orange-500/20 shadow-orange-500/10 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-3 rounded-2xl bg-orange-500 text-white shadow-orange-500/30 shadow-lg group-hover:rotate-12 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500/60">Em Negociação</span>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="text-4xl font-black text-foreground">{negotiationCount}</div>
                        <p className="text-xs text-muted-foreground font-medium">Potencial: {potentialValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group relative rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-8 border border-emerald-500/20 shadow-emerald-500/10 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg group-hover:rotate-12 transition-transform">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Vendas Fechadas</span>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="text-4xl font-black text-foreground">{closedCount}</div>
                        <p className="text-xs text-muted-foreground font-medium">Total: {closedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="group relative rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 to-pink-500/5 p-8 border border-pink-500/20 shadow-pink-500/10 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-3 rounded-2xl bg-pink-500 text-white shadow-pink-500/30 shadow-lg group-hover:rotate-12 transition-transform">
                            <Package className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500/60">Total Pipeline</span>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="text-4xl font-black text-foreground">{totalLeads}</div>
                        <p className="text-xs text-muted-foreground font-medium">Volume total no CRM</p>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row: Charts & Activity */}
            <div className="grid gap-8 lg:grid-cols-7">
                <Card className="lg:col-span-4 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Funil de Vendas</h3>
                            <p className="text-sm text-muted-foreground">Distribuição por etapa do processo</p>
                        </div>
                        <Badge variant="outline" className="px-4 py-1.5 opacity-60 font-black tracking-tighter bg-foreground/5 text-foreground border-foreground/10">LIVE FLOW</Badge>
                    </div>
                    <div className="space-y-6">
                        {leadsByStage.map((stage, idx) => (
                            <div key={stage.id} className="group/stage relative">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn("w-3 h-3 rounded-full shadow-lg transition-all group-hover/stage:scale-150 group-hover/stage:shadow-primary/50")}
                                            style={{ backgroundColor: stage.color }}
                                        />
                                        <span className="font-bold text-sm tracking-tight text-foreground/80 dark:text-white/90 group-hover/stage:text-foreground dark:group-hover/stage:text-white transition-colors">{stage.title}</span>
                                    </div>
                                    <motion.span
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (idx * 0.1) }}
                                        className="font-black text-sm text-primary"
                                    >
                                        {stage.count}
                                    </motion.span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stage.count / (totalLeads || 1)) * 100}%` }}
                                        transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                                        className={cn("h-full rounded-full shadow-glow relative z-10")}
                                        style={{ backgroundColor: stage.color }}
                                    >
                                        <motion.div
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="lg:col-span-3 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Atividades Recentes</h3>
                            <p className="text-sm text-muted-foreground">Últimos leads registrados</p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {recentLeads.map((customer, idx) => (
                            <motion.div
                                key={customer.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (idx * 0.1) }}
                                className="group flex items-center justify-between p-4 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {customer.avatar ? (
                                            <div className="h-10 w-10 rounded-2xl bg-muted overflow-hidden ring-2 ring-white/10 group-hover:ring-primary/50 transition-all">
                                                <img src={customer.avatar} alt={customer.name} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-black text-xs ring-2 ring-white/10 group-hover:ring-primary/50 transition-all">
                                                {customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#020617]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{customer.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{customer.company}</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-muted-foreground group-hover:text-white transition-colors">
                                    {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
