import React, { useState } from 'react';
import { useStore } from '../store';
import { Customer, KanbanStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from './ui/primitives';
import { Search, Phone, Mail, Building, Tag as TagIcon, Settings } from 'lucide-react';
import { CustomerDetailsModal } from './CustomerDetailsModal';

export const CustomerList = () => {
    const { customers, tags, deleteCustomer } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const clients = customers.filter(c =>
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const { isLoading } = useStore();

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <header className="flex flex-col gap-2">
                    <div className="h-10 w-64 bg-white/5 rounded-2xl" />
                    <div className="h-4 w-48 bg-white/5 rounded-lg" />
                </header>
                <div className="flex items-center justify-between gap-4">
                    <div className="h-12 flex-1 max-w-md bg-white/5 rounded-2xl" />
                    <div className="h-12 w-32 bg-white/5 rounded-2xl" />
                </div>
                <div className="h-[500px] w-full bg-white/5 border border-white/10 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tighter text-white sm:text-4xl">Base de <span className="text-primary">Clientes</span></h2>
                <p className="text-muted-foreground font-medium">Visualize e gerencie todos os contatos da sua plataforma.</p>
            </header>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Pesquisar por nome, empresa ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10"
                    />
                </div>
                <Button className="rounded-2xl shadow-glow">
                    Exportar Base
                </Button>
            </div>

            <Card className="overflow-hidden border-white/5 bg-white/[0.02]">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="h-14 px-6 text-left align-middle font-black uppercase tracking-widest text-[10px] text-muted-foreground">Cliente / Instituição</th>
                                <th className="h-14 px-6 text-left align-middle font-black uppercase tracking-widest text-[10px] text-muted-foreground">Informações de Contato</th>
                                <th className="h-14 px-6 text-left align-middle font-black uppercase tracking-widest text-[10px] text-muted-foreground">Valor Acumulado</th>
                                <th className="h-14 px-6 text-right align-middle font-black uppercase tracking-widest text-[10px] text-muted-foreground pr-8">Operações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-muted-foreground italic">
                                        Nenhum cliente disponível no momento.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="group transition-all hover:bg-white/[0.03]">
                                        <td className="p-6 align-middle">
                                            <div className="flex items-center gap-4">
                                                {client.avatar && client.avatar.startsWith('http') ? (
                                                    <img src={client.avatar} alt={client.name} className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-primary/50 transition-all" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-primary font-black border border-primary/20">
                                                        {client.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-primary transition-colors">{client.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                                        <Building className="h-3 w-3 text-primary/60" /> {client.company || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center text-xs font-medium text-white/70">
                                                    <Mail className="mr-2 h-3.5 w-3.5 text-primary/60" />
                                                    {client.email || '—'}
                                                </div>
                                                <div className="flex items-center text-xs font-medium text-white/70">
                                                    <Phone className="mr-2 h-3.5 w-3.5 text-emerald-400/60" />
                                                    {client.phone || '—'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs">
                                                {client.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle text-right pr-8">
                                            <Button variant="ghost" size="sm" className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20" onClick={() => setSelectedCustomer(client)}>
                                                <Settings className="h-4 w-4 mr-2 text-primary" /> Gerenciar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <CustomerDetailsModal
                customer={selectedCustomer}
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                // @ts-ignore
                onDelete={(id) => {
                    if (confirm('Deseja realmente remover este cliente?')) {
                        deleteCustomer(id);
                        setSelectedCustomer(null);
                    }
                }}
            />
        </div>
    );
};
